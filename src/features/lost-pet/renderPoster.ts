import { wrapText } from './layoutText'
import type { LostPetPosterInput, PosterFormat } from './types'

const dimensions: Record<PosterFormat, { width: number; height: number }> = {
  social: { width: 1080, height: 1440 },
  a4: { width: 2480, height: 3508 },
}

function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('无法生成海报图片')), 'image/png')
  })
}

function loadPhoto(photo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(photo)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('照片无法读取'))
    }
    image.src = url
  })
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawnWidth = image.naturalWidth * scale
  const drawnHeight = image.naturalHeight * scale
  context.drawImage(image, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight)
}

interface PosterLayout {
  bodySize: number
  headingSize: number
  lineHeight: number
  startY: number
  photoHeight: number
  photoGap: number
  blocks: ReadonlyArray<{ label: string; lines: string[] }>
}

function layoutText(context: CanvasRenderingContext2D, width: number, height: number, padding: number, hasPhoto: boolean, blocks: ReadonlyArray<{ label: string; value: string }>): PosterLayout {
  const maxBodySize = Math.round(width * 0.038)
  const minBodySize = Math.max(15, Math.round(width * 0.014))
  const footerY = height - padding
  const preferredPhotoHeight = Math.round(height * 0.16)
  const minimumPhotoHeight = Math.round(height * 0.08)

  for (let bodySize = maxBodySize; bodySize >= minBodySize; bodySize -= 1) {
    const headingSize = Math.max(Math.round(bodySize * 1.8), Math.round(width * 0.055))
    const lineHeight = Math.ceil(bodySize * 1.38)
    const startY = padding + headingSize + Math.ceil(bodySize * 1.3)
    const photoGap = hasPhoto ? Math.ceil(lineHeight * 0.8) : 0
    context.font = `500 ${bodySize}px sans-serif`
    const laidOutBlocks = blocks.map((block) => ({ label: block.label, lines: wrapText(context, block.value || '未提供', width - padding * 2) }))
    const textHeight = laidOutBlocks.reduce((total, block) => total + lineHeight * (1 + block.lines.length) + Math.ceil(lineHeight * 0.3), 0)
    const photoRoom = footerY - startY - textHeight - lineHeight - photoGap

    if ((!hasPhoto && photoRoom >= 0) || (hasPhoto && photoRoom >= minimumPhotoHeight)) {
      return { bodySize, headingSize, lineHeight, startY, photoHeight: hasPhoto ? Math.min(preferredPhotoHeight, photoRoom) : 0, photoGap, blocks: laidOutBlocks }
    }
  }

  throw new Error('海报内容过长，无法在画布内排版')
}

export async function renderPoster(input: LostPetPosterInput, format: PosterFormat): Promise<Blob> {
  const { width, height } = dimensions[format]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('浏览器不支持海报绘制')

  const padding = Math.round(width * 0.08)
  context.fillStyle = '#fffdf8'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#b85c3d'
  context.fillRect(0, 0, width, Math.round(height * 0.025))
  context.fillStyle = '#32483d'
  const blocks = [
    { label: '宠物名称', value: input.petName },
    { label: '走失时间', value: input.lostAt },
    { label: '走失地点', value: input.location },
    { label: '特征', value: input.features },
    { label: '联系方式', value: input.contact },
    ...(input.reward ? [{ label: '酬谢', value: input.reward }] : []),
  ]
  let image: HTMLImageElement | undefined
  if (input.photo) {
    try {
      image = await loadPhoto(input.photo)
    } catch {
      // A readable poster is still more useful than failing because a photo is corrupt.
    }
  }
  const layout = layoutText(context, width, height, padding, Boolean(image), blocks)
  context.font = `800 ${layout.headingSize}px sans-serif`
  context.fillText('走失寻宠', padding, padding + layout.headingSize)

  let cursor = layout.startY
  if (image && layout.photoHeight > 0) {
    context.save()
    context.beginPath()
    context.rect(padding, cursor, width - padding * 2, layout.photoHeight)
    context.clip()
    drawCover(context, image, padding, cursor, width - padding * 2, layout.photoHeight)
    context.restore()
    cursor += layout.photoHeight + layout.photoGap
  }

  const drawBlock = (block: { label: string; lines: string[] }) => {
    context.fillStyle = '#b85c3d'
    context.font = `800 ${layout.bodySize}px sans-serif`
    context.fillText(block.label, padding, cursor)
    cursor += layout.lineHeight
    context.fillStyle = '#1f3028'
    context.font = `500 ${layout.bodySize}px sans-serif`
    for (const line of block.lines) {
      context.fillText(line, padding, cursor)
      cursor += layout.lineHeight
    }
    cursor += Math.ceil(layout.lineHeight * 0.3)
  }

  layout.blocks.forEach(drawBlock)

  context.fillStyle = '#32483d'
  context.font = `700 ${Math.round(layout.bodySize * 0.8)}px sans-serif`
  context.fillText('如有线索，请及时联系。感谢每一次转发。', padding, height - padding)
  return blobFromCanvas(canvas)
}
