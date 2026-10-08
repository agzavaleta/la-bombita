const BRUSH_SIZE = 30
const DRAWING_INSET = 12
const PIXEL_SAMPLE_STEP = 4
const sparkSampleIndices = new WeakMap<HTMLCanvasElement, number[]>()

export type ScratchPoint = {
  x: number
  y: number
}

function isSparkPixel(pixels: Uint8ClampedArray, pixelIndex: number, xRatio: number, yRatio: number): boolean {
  if (xRatio < 0.68 || xRatio > 0.98 || yRatio > 0.34) {
    return false
  }

  const red = pixels[pixelIndex] ?? 0
  const green = pixels[pixelIndex + 1] ?? 0
  const blue = pixels[pixelIndex + 2] ?? 0
  const alpha = pixels[pixelIndex + 3] ?? 0

  return alpha >= 32 && red >= 210 && green >= 80 && blue <= 110 && red - blue >= 120
}

function collectSparkSampleIndices(canvas: HTMLCanvasElement): number[] {
  const context = canvas.getContext("2d", { willReadFrequently: true })

  if (!context || canvas.width === 0 || canvas.height === 0) {
    return []
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const samples: number[] = []

  for (let y = 0; y < canvas.height; y += PIXEL_SAMPLE_STEP) {
    for (let x = 0; x < canvas.width; x += PIXEL_SAMPLE_STEP) {
      const pixelIndex = (y * canvas.width + x) * 4

      if (isSparkPixel(pixels, pixelIndex, x / canvas.width, y / canvas.height)) {
        samples.push(pixelIndex + 3)
      }
    }
  }

  return samples
}

export function paintLitBombCanvas(canvas: HTMLCanvasElement, litBombImage: HTMLImageElement): boolean {
  const bounds = canvas.getBoundingClientRect()

  if (bounds.width <= 0 || bounds.height <= 0 || !litBombImage.complete || litBombImage.naturalWidth === 0) {
    return false
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const inset = DRAWING_INSET * pixelRatio
  canvas.width = Math.round(bounds.width * pixelRatio)
  canvas.height = Math.round(bounds.height * pixelRatio)

  const context = canvas.getContext("2d")

  if (!context) {
    return false
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(litBombImage, inset, inset, canvas.width - inset * 2, canvas.height - inset * 2)
  sparkSampleIndices.set(canvas, collectSparkSampleIndices(canvas))
  return true
}

export function getScratchPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): ScratchPoint {
  const bounds = canvas.getBoundingClientRect()

  return {
    x: (clientX - bounds.left) * (canvas.width / bounds.width),
    y: (clientY - bounds.top) * (canvas.height / bounds.height),
  }
}

export function eraseScratchPath(
  canvas: HTMLCanvasElement,
  point: ScratchPoint,
  previousPoint: ScratchPoint,
): void {
  const context = canvas.getContext("2d")

  if (!context) {
    return
  }

  const scale = canvas.width / canvas.getBoundingClientRect().width
  context.save()
  context.globalCompositeOperation = "destination-out"
  context.lineCap = "round"
  context.lineJoin = "round"
  context.lineWidth = BRUSH_SIZE * scale
  context.beginPath()
  context.moveTo(previousPoint.x, previousPoint.y)
  context.lineTo(point.x, point.y)
  context.stroke()
  context.restore()
}

export function getRevealedRatio(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  const samples = sparkSampleIndices.get(canvas) ?? []

  if (!context || samples.length === 0 || canvas.width === 0 || canvas.height === 0) {
    return 0
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let erasedSamples = 0

  samples.forEach((alphaIndex) => {
    if ((pixels[alphaIndex] ?? 255) < 32) {
      erasedSamples += 1
    }
  })

  return erasedSamples / samples.length
}
