import type { LostPetPosterInput, PosterFormat } from './types'

type PosterRenderer = (input: LostPetPosterInput, format: PosterFormat) => Promise<Blob>
type Download = (blob: Blob, format: PosterFormat) => void

interface PosterActionDependencies {
  render: PosterRenderer
  download: Download
  canShare?: (data: ShareData) => boolean
  share?: (data: ShareData) => Promise<void>
  createFile?: (blob: Blob) => File
}

export function hasRequiredPosterFields(input: LostPetPosterInput): boolean {
  return [input.petName, input.lostAt, input.location, input.features, input.contact].every((value) => value.trim().length > 0)
}

export async function downloadPoster(input: LostPetPosterInput, format: PosterFormat, dependencies: Pick<PosterActionDependencies, 'render' | 'download'>): Promise<'invalid' | 'downloaded'> {
  if (!hasRequiredPosterFields(input)) return 'invalid'
  const blob = await dependencies.render(input, format)
  dependencies.download(blob, format)
  return 'downloaded'
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export async function shareSocialPoster(input: LostPetPosterInput, dependencies: PosterActionDependencies): Promise<'invalid' | 'downloaded' | 'shared' | 'cancelled'> {
  if (!hasRequiredPosterFields(input)) return 'invalid'
  const blob = await dependencies.render(input, 'social')
  const file = dependencies.createFile?.(blob) ?? new File([blob], '寻宠海报-social.png', { type: 'image/png' })
  const files: ShareData = { files: [file] }

  if (dependencies.canShare?.(files) !== true || !dependencies.share) {
    dependencies.download(blob, 'social')
    return 'downloaded'
  }

  try {
    await dependencies.share({ title: '走失寻宠', files: [file] })
    return 'shared'
  } catch (error) {
    if (isAbortError(error)) return 'cancelled'
    dependencies.download(blob, 'social')
    return 'downloaded'
  }
}
