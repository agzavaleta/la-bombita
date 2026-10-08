const BRUSH_SIZE = 30
const PIXEL_SAMPLE_STEP = 8
const initialOpaqueSamples = new WeakMap<HTMLCanvasElement, number>()

export type ScratchPoint = {
  x: number
  y: number
}

function drawSparkMask(context: CanvasRenderingContext2D, width: number, height: number): void {
  const centerX = width / 2
  const centerY = height / 2
  const outerRadius = Math.min(width, height) * 0.42
  const innerRadius = outerRadius * 0.56
  const points = 10

  context.beginPath()

  for (let pointIndex = 0; pointIndex < points * 2; pointIndex += 1) {
    const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius
    const angle = -Math.PI / 2 + (pointIndex * Math.PI) / points
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    if (pointIndex === 0) {
      context.moveTo(x, y)
    } else {
      context.lineTo(x, y)
    }
  }

  context.closePath()
}

function countOpaqueSamples(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext("2d", { willReadFrequently: true })

  if (!context) {
    return 0
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let opaqueSamples = 0

  for (let alphaIndex = 3; alphaIndex < pixels.length; alphaIndex += 4 * PIXEL_SAMPLE_STEP) {
    if ((pixels[alphaIndex] ?? 0) >= 32) {
      opaqueSamples += 1
    }
  }

  return opaqueSamples
}

export function paintSparkScratchSurface(canvas: HTMLCanvasElement): void {
  const bounds = canvas.getBoundingClientRect()
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(bounds.width * pixelRatio)
  canvas.height = Math.round(bounds.height * pixelRatio)

  const context = canvas.getContext("2d")

  if (!context) {
    return
  }

  context.globalCompositeOperation = "source-over"
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawSparkMask(context, canvas.width, canvas.height)
  context.fillStyle = "#cbd5e1"
  context.fill()

  context.save()
  drawSparkMask(context, canvas.width, canvas.height)
  context.clip()

  const textureDots = Math.round((canvas.width * canvas.height) / 180)
  context.fillStyle = "rgba(100, 116, 139, 0.28)"

  for (let dot = 0; dot < textureDots; dot += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 1.6 * pixelRatio + 0.4
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
  initialOpaqueSamples.set(canvas, countOpaqueSamples(canvas))
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
  const initialSamples = initialOpaqueSamples.get(canvas) ?? 0

  if (initialSamples === 0) {
    return 0
  }

  const remainingSamples = countOpaqueSamples(canvas)
  return Math.min(1, Math.max(0, 1 - remainingSamples / initialSamples))
}
