const BRUSH_SIZE = 52
const PIXEL_SAMPLE_STEP = 16

export type ScratchPoint = {
  x: number
  y: number
}

export function paintScratchSurface(canvas: HTMLCanvasElement): void {
  const bounds = canvas.getBoundingClientRect()
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(bounds.width * pixelRatio)
  canvas.height = Math.round(bounds.height * pixelRatio)

  const context = canvas.getContext("2d")

  if (!context) {
    return
  }

  context.globalCompositeOperation = "source-over"
  context.fillStyle = "#cbd5e1"
  context.fillRect(0, 0, canvas.width, canvas.height)

  const textureDots = Math.round((canvas.width * canvas.height) / 900)
  context.fillStyle = "rgba(100, 116, 139, 0.28)"

  for (let dot = 0; dot < textureDots; dot += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 1.6 * pixelRatio + 0.4
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
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

  if (!context) {
    return 0
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let transparentSamples = 0
  let totalSamples = 0

  for (let alphaIndex = 3; alphaIndex < pixels.length; alphaIndex += 4 * PIXEL_SAMPLE_STEP) {
    totalSamples += 1
    if ((pixels[alphaIndex] ?? 255) < 32) {
      transparentSamples += 1
    }
  }

  return totalSamples === 0 ? 0 : transparentSamples / totalSamples
}
