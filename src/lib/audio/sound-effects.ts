type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

type IOSAudioContextState = AudioContextState | "interrupted"

type NavigatorWithAudioSession = Navigator & {
  audioSession?: {
    type: string
  }
}

let audioContext: AudioContext | undefined
let isAudioUnlocked = false
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

  isAudioUnlocked = false
  needsContextRecreation = true
}

function discardAudioContext(): void {
  const context = audioContext
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

function attemptContextResume(context: AudioContext): void {
  if (getContextState(context) === "running") {
    return
  }

  try {
    void context
      .resume()
      .then(() => {
        if (audioContext === context && getContextState(context) !== "running") {
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

export function playExplosionSound(): void {
  runAudioEffect((context) => {
    const startTime = context.currentTime + 0.005
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.52, startTime)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4)
    masterGain.connect(context.destination)

    const boom = context.createOscillator()
    const boomGain = createEnvelope(context, 0.28, 0.012, 0.38)
    boom.type = "sine"
    boom.frequency.setValueAtTime(125, startTime)
    boom.frequency.exponentialRampToValueAtTime(52, startTime + 0.34)
    boom.connect(boomGain).connect(masterGain)
    boom.start(startTime)
    boom.stop(startTime + 0.4)

    const pop = context.createOscillator()
    const popGain = createEnvelope(context, 0.13, 0.006, 0.16)
    pop.type = "triangle"
    pop.frequency.setValueAtTime(520, startTime)
    pop.frequency.exponentialRampToValueAtTime(170, startTime + 0.14)
    pop.connect(popGain).connect(masterGain)
    pop.start(startTime)
    pop.stop(startTime + 0.18)

    const noiseLength = Math.floor(context.sampleRate * 0.18)
    const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)

    for (let index = 0; index < noiseLength; index += 1) {
      noiseData[index] = Math.random() * 2 - 1
    }

    const noise = context.createBufferSource()
    const noiseFilter = context.createBiquadFilter()
    const noiseGain = createEnvelope(context, 0.12, 0.008, 0.2)
    noise.buffer = noiseBuffer
    noiseFilter.type = "lowpass"
    noiseFilter.frequency.setValueAtTime(1100, startTime)
    noiseFilter.frequency.exponentialRampToValueAtTime(260, startTime + 0.18)
    noise.connect(noiseFilter).connect(noiseGain).connect(masterGain)
    noise.start(startTime)
    noise.stop(startTime + 0.2)
  })
}

export function playPrizeRevealSound(): void {
  runAudioEffect((context) => {
    const startTime = context.currentTime + 0.005
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.42, startTime)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.54)
    masterGain.connect(context.destination)

    const notes = [
      { frequency: 659.25, offset: 0, duration: 0.34 },
      { frequency: 880, offset: 0.16, duration: 0.38 },
    ] as const

    notes.forEach((note) => {
      const noteStartTime = startTime + note.offset
      const oscillator = context.createOscillator()
      const noteGain = context.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(note.frequency, noteStartTime)
      noteGain.gain.setValueAtTime(0.0001, noteStartTime)
      noteGain.gain.exponentialRampToValueAtTime(0.18, noteStartTime + 0.015)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + note.duration)
      oscillator.connect(noteGain).connect(masterGain)
      oscillator.start(noteStartTime)
      oscillator.stop(noteStartTime + note.duration)
    })
  })
}
