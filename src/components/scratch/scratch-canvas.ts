const BRUSH_SIZE = 30
const CANVAS_OVERFLOW_RATIO = 0.07
const DRAWING_INSET = 12
const PIXEL_SAMPLE_STEP = 4
// The lit and unlit assets have different fuse geometry; align the isolated spark with the unlit fuse tip.
const SPARK_OFFSET_X_RATIO = 0.103
const SPARK_OFFSET_Y_RATIO = -0.131
const sparkSampleIndices = new WeakMap<HTMLCanvasElement, number[]>()

export type ScratchPoint = {
  x: number
  y: number
}

function isSparkPixel(pixels: Uint8ClampedArray, pixelIndex: number, xRatio: number, yRatio: number): boolean {
  const isInsideSparkBounds = xRatio >= 0.68 && xRatio <= 0.99 && yRatio >= 0.03 && yRatio <= 0.35
  const isInsideFusePath = xRatio < 0.78 && yRatio > 0.23

  if (!isInsideSparkBounds || isInsideFusePath) {
    return false
  }

  const red = pixels[pixelIndex] ?? 0
  const green = pixels[pixelIndex + 1] ?? 0
  const blue = pixels[pixelIndex + 2] ?? 0
  const alpha = pixels[pixelIndex + 3] ?? 0

  return alpha >= 16 && red >= 225 && green >= 80 && blue <= 70 && red - blue >= 155
}

function isolateSparkPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  baseWidth: number,
  baseHeight: number,
  baseOffsetY: number,
): void {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4
      const isSpark = isSparkPixel(
        pixels,
        pixelIndex,
        x / baseWidth,
        (y - baseOffsetY) / baseHeight,
      )

      if (!isSpark) {
        pixels[pixelIndex + 3] = 0
      }
    }
  }
}

function collectSparkSampleIndices(pixels: Uint8ClampedArray, width: number, height: number): number[] {
  const samples: number[] = []

  for (let y = 0; y < height; y += PIXEL_SAMPLE_STEP) {
    for (let x = 0; x < width; x += PIXEL_SAMPLE_STEP) {
      const alphaIndex = (y * width + x) * 4 + 3

      if ((pixels[alphaIndex] ?? 0) >= 16) {
        samples.push(alphaIndex)
      }
    }
  }

  return samples
}

export function paintSparkCanvas(canvas: HTMLCanvasElement, litBombImage: HTMLImageElement): boolean {
  const bounds = canvas.getBoundingClientRect()

  if (bounds.width <= 0 || bounds.height <= 0 || !litBombImage.complete || litBombImage.naturalWidth === 0) {
    return false
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const inset = DRAWING_INSET * pixelRatio
  const baseWidth = (bounds.width / (1 + CANVAS_OVERFLOW_RATIO)) * pixelRatio
  const baseHeight = (bounds.height / (1 + CANVAS_OVERFLOW_RATIO)) * pixelRatio
  const baseOffsetY = baseHeight * CANVAS_OVERFLOW_RATIO
  canvas.width = Math.round(bounds.width * pixelRatio)
  canvas.height = Math.round(bounds.height * pixelRatio)

  const context = canvas.getContext("2d", { willReadFrequently: true })

  if (!context) {
    return false
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(
    litBombImage,
    inset,
    baseOffsetY + inset,
    baseWidth - inset * 2,
    baseHeight - inset * 2,
  )
  const sparkLayer = context.getImageData(0, 0, canvas.width, canvas.height)
  isolateSparkPixels(
    sparkLayer.data,
    canvas.width,
    canvas.height,
    baseWidth,
    baseHeight,
    baseOffsetY,
  )

  const offsetX = Math.round(baseWidth * SPARK_OFFSET_X_RATIO)
  const offsetY = Math.round(baseHeight * SPARK_OFFSET_Y_RATIO)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.putImageData(sparkLayer, offsetX, offsetY)

  const alignedSparkLayer = context.getImageData(0, 0, canvas.width, canvas.height)
  const samples = collectSparkSampleIndices(alignedSparkLayer.data, canvas.width, canvas.height)
  sparkSampleIndices.set(canvas, samples)
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
