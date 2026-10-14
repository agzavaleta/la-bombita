type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

type IOSAudioContextState = AudioContextState | "interrupted"

type NavigatorWithAudioSession = Navigator & {
  audioSession?: {
    type: string
  }
}

type ActiveScratchSound = {
  context: AudioContext
  gain: GainNode
  highpass: BiquadFilterNode
  isStopping: boolean
  lowpass: BiquadFilterNode
  source: AudioBufferSourceNode
}

let audioContext: AudioContext | undefined
let activeScratchSound: ActiveScratchSound | undefined
let effectsCompressor: DynamicsCompressorNode | undefined
let effectsOutputGain: GainNode | undefined
let isAudioUnlocked = false
let isScratchSoundRequested = false
let needsContextRecreation = false
let isVisibilityRecoveryRegistered = false

function getContextState(context: AudioContext): IOSAudioContextState {
  return context.state
}

function isContextUnusable(context: AudioContext): boolean {
  const state = getContextState(context)
  return state === "closed" || state === "interrupted"
}

function markContextForRecreation(context: AudioContext): void {
  if (audioContext !== context) {
    return
  }

  isScratchSoundRequested = false
  stopActiveScratchSound(0)
  isAudioUnlocked = false
  needsContextRecreation = true
}

function discardAudioContext(): void {
  const context = audioContext
  isScratchSoundRequested = false
  stopActiveScratchSound(0)
  effectsCompressor?.disconnect()
  effectsOutputGain?.disconnect()
  effectsCompressor = undefined
  effectsOutputGain = undefined
  audioContext = undefined
  isAudioUnlocked = false
  needsContextRecreation = false

  if (context && getContextState(context) !== "closed") {
    void context.close().catch(() => undefined)
  }
}

function configureIOSAudioSession(): void {
  try {
    const audioSession = (navigator as NavigatorWithAudioSession).audioSession

    if (audioSession) {
      audioSession.type = "playback"
    }
  } catch {
    // Web Audio sigue disponible aunque iOS no exponga o rechace AudioSession.
  }
}

function createAudioContext(): AudioContext | undefined {
  const AudioContextConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext

  if (!AudioContextConstructor) {
    return undefined
  }

  try {
    return new AudioContextConstructor()
  } catch {
    return undefined
  }
}

function getAudioContextForGesture(): AudioContext | undefined {
  if (audioContext && (needsContextRecreation || isContextUnusable(audioContext))) {
    discardAudioContext()
  }

  if (!audioContext) {
    audioContext = createAudioContext()
  }

  return audioContext
}

function warmUpAudioOutput(context: AudioContext): void {
  const buffer = context.createBuffer(1, 1, context.sampleRate)
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start()
}

function getEffectsOutput(context: AudioContext): DynamicsCompressorNode {
  if (effectsCompressor) {
    return effectsCompressor
  }

  const compressor = context.createDynamicsCompressor()
  compressor.threshold.setValueAtTime(-15, context.currentTime)
  compressor.knee.setValueAtTime(14, context.currentTime)
  compressor.ratio.setValueAtTime(4, context.currentTime)
  compressor.attack.setValueAtTime(0.004, context.currentTime)
  compressor.release.setValueAtTime(0.22, context.currentTime)
  const outputGain = context.createGain()
  outputGain.gain.setValueAtTime(1.35, context.currentTime)
  compressor.connect(outputGain).connect(context.destination)
  effectsCompressor = compressor
  effectsOutputGain = outputGain
  return compressor
}

function disconnectScratchSound(sound: ActiveScratchSound): void {
  sound.source.disconnect()
  sound.highpass.disconnect()
  sound.lowpass.disconnect()
  sound.gain.disconnect()
}

function stopActiveScratchSound(fadeDuration = 0.03): void {
  const sound = activeScratchSound

  if (!sound || sound.isStopping) {
    return
  }

  sound.isStopping = true
  const now = sound.context.currentTime
  const stopTime = now + fadeDuration

  try {
    sound.gain.gain.cancelScheduledValues(now)
    sound.gain.gain.setValueAtTime(Math.max(sound.gain.gain.value, 0.0001), now)

    if (fadeDuration > 0) {
      sound.gain.gain.exponentialRampToValueAtTime(0.0001, stopTime)
    } else {
      sound.gain.gain.setValueAtTime(0.0001, now)
    }

    sound.source.addEventListener(
      "ended",
      () => {
        if (activeScratchSound === sound) {
          activeScratchSound = undefined
        }

        disconnectScratchSound(sound)

        if (isScratchSoundRequested) {
          startScratchSound()
        }
      },
      { once: true },
    )
    sound.source.stop(stopTime + 0.005)
  } catch {
    if (activeScratchSound === sound) {
      activeScratchSound = undefined
    }

    disconnectScratchSound(sound)
  }
}

function attemptContextResume(context: AudioContext, onRunning?: () => void): void {
  if (getContextState(context) === "running") {
    onRunning?.()
    return
  }

  try {
    void context
      .resume()
      .then(() => {
        if (audioContext !== context) {
          return
        }

        if (getContextState(context) === "running") {
          onRunning?.()
        } else {
          markContextForRecreation(context)
        }
      })
      .catch(() => markContextForRecreation(context))
  } catch {
    markContextForRecreation(context)
  }
}

function recoverAudioAfterVisibilityChange(): void {
  if (document.visibilityState !== "visible" || !audioContext) {
    return
  }

  const context = audioContext
  const state = getContextState(context)

  if (state === "closed" || state === "interrupted") {
    markContextForRecreation(context)
    return
  }

  if (state === "suspended") {
    attemptContextResume(context)
  }
}

function registerVisibilityRecovery(): void {
  if (isVisibilityRecoveryRegistered) {
    return
  }

  document.addEventListener("visibilitychange", recoverAudioAfterVisibilityChange)
  isVisibilityRecoveryRegistered = true
}

function createEnvelope(
  context: AudioContext,
  peak: number,
  attackTime: number,
  releaseTime: number,
): GainNode {
  const gain = context.createGain()
  const startTime = context.currentTime
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peak, startTime + attackTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + releaseTime)
  return gain
}

function runAudioEffect(effect: (context: AudioContext) => void): void {
  const context = audioContext

  if (!context || !isAudioUnlocked || needsContextRecreation) {
    return
  }

  const state = getContextState(context)

  if (state === "running") {
    try {
      effect(context)
    } catch {
      markContextForRecreation(context)
    }

    return
  }

  if (state === "closed" || state === "interrupted") {
    markContextForRecreation(context)
    return
  }

  attemptContextResume(context)
}

export function unlockAudio(): void {
  try {
    configureIOSAudioSession()
    registerVisibilityRecovery()

    const context = getAudioContextForGesture()

    if (!context) {
      return
    }

    attemptContextResume(context)
    warmUpAudioOutput(context)
    isAudioUnlocked = true
  } catch {
    if (audioContext) {
      markContextForRecreation(audioContext)
    }
  }
}

export function startScratchSound(): void {
  isScratchSoundRequested = true

  if (activeScratchSound || !audioContext || !isAudioUnlocked || needsContextRecreation) {
    return
  }

  const context = audioContext

  if (getContextState(context) !== "running") {
    attemptContextResume(context, () => {
      if (isScratchSoundRequested) {
        startScratchSound()
      }
    })
    return
  }

  runAudioEffect((runningContext) => {
    if (activeScratchSound || !isScratchSoundRequested) {
      return
    }

    const noiseLength = Math.max(1, Math.floor(runningContext.sampleRate))
    const noiseBuffer = runningContext.createBuffer(1, noiseLength, runningContext.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)

    for (let index = 0; index < noiseLength; index += 1) {
      noiseData[index] = Math.random() * 2 - 1
    }

    const source = runningContext.createBufferSource()
    const highpass = runningContext.createBiquadFilter()
    const lowpass = runningContext.createBiquadFilter()
    const gain = runningContext.createGain()
    const now = runningContext.currentTime

    source.buffer = noiseBuffer
    source.loop = true
    highpass.type = "highpass"
    highpass.frequency.setValueAtTime(850, now)
    highpass.Q.setValueAtTime(0.7, now)
    lowpass.type = "lowpass"
    lowpass.frequency.setValueAtTime(4200, now)
    lowpass.Q.setValueAtTime(0.7, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.025)
    source.connect(highpass).connect(lowpass).connect(gain).connect(getEffectsOutput(runningContext))

    activeScratchSound = { context: runningContext, gain, highpass, isStopping: false, lowpass, source }
    source.start()
  })
}

export function stopScratchSound(): void {
  isScratchSoundRequested = false
  stopActiveScratchSound()
}

export function playExplosionSound(): void {
  runAudioEffect((context) => {
    const startTime = context.currentTime + 0.005
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.85, startTime)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.42)
    masterGain.connect(getEffectsOutput(context))

    const boom = context.createOscillator()
    const boomGain = createEnvelope(context, 0.55, 0.008, 0.36)
    boom.type = "triangle"
    boom.frequency.setValueAtTime(270, startTime)
    boom.frequency.exponentialRampToValueAtTime(125, startTime + 0.34)
    boom.connect(boomGain).connect(masterGain)
    boom.start(startTime)
    boom.stop(startTime + 0.38)
    boom.addEventListener(
      "ended",
      () => {
        boom.disconnect()
        boomGain.disconnect()
        masterGain.disconnect()
      },
      { once: true },
    )

    const pop = context.createOscillator()
    const popGain = createEnvelope(context, 0.42, 0.004, 0.15)
    pop.type = "triangle"
    pop.frequency.setValueAtTime(850, startTime)
    pop.frequency.exponentialRampToValueAtTime(300, startTime + 0.14)
    pop.connect(popGain).connect(masterGain)
    pop.start(startTime)
    pop.stop(startTime + 0.16)
    pop.addEventListener(
      "ended",
      () => {
        pop.disconnect()
        popGain.disconnect()
      },
      { once: true },
    )

    const noiseLength = Math.floor(context.sampleRate * 0.23)
    const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)

    for (let index = 0; index < noiseLength; index += 1) {
      noiseData[index] = Math.random() * 2 - 1
    }

    const noise = context.createBufferSource()
    const noiseHighpass = context.createBiquadFilter()
    const noiseLowpass = context.createBiquadFilter()
    const noiseGain = createEnvelope(context, 0.32, 0.005, 0.23)
    noise.buffer = noiseBuffer
    noiseHighpass.type = "highpass"
    noiseHighpass.frequency.setValueAtTime(700, startTime)
    noiseLowpass.type = "lowpass"
    noiseLowpass.frequency.setValueAtTime(2500, startTime)
    noiseLowpass.frequency.exponentialRampToValueAtTime(1200, startTime + 0.22)
    noise.connect(noiseHighpass).connect(noiseLowpass).connect(noiseGain).connect(masterGain)
    noise.start(startTime)
    noise.stop(startTime + 0.24)
    noise.addEventListener(
      "ended",
      () => {
        noise.disconnect()
        noiseHighpass.disconnect()
        noiseLowpass.disconnect()
        noiseGain.disconnect()
      },
      { once: true },
    )
  })
}

export function playPrizeRevealSound(): void {
  runAudioEffect((context) => {
    const startTime = context.currentTime + 0.005
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.62, startTime)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.54)
    masterGain.connect(getEffectsOutput(context))

    const notes = [
      { frequency: 659.25, offset: 0, duration: 0.34 },
      { frequency: 880, offset: 0.16, duration: 0.38 },
    ] as const

    notes.forEach((note, index) => {
      const noteStartTime = startTime + note.offset
      const oscillator = context.createOscillator()
      const noteGain = context.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(note.frequency, noteStartTime)
      noteGain.gain.setValueAtTime(0.0001, noteStartTime)
      noteGain.gain.exponentialRampToValueAtTime(0.3, noteStartTime + 0.015)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + note.duration)
      oscillator.connect(noteGain).connect(masterGain)
      oscillator.start(noteStartTime)
      oscillator.stop(noteStartTime + note.duration)
      oscillator.addEventListener(
        "ended",
        () => {
          oscillator.disconnect()
          noteGain.disconnect()

          if (index === notes.length - 1) {
            masterGain.disconnect()
          }
        },
        { once: true },
      )
    })
  })
}
