export type PosterFormat = 'social' | 'a4'

export interface LostPetPosterInput {
  petName: string
  lostAt: string
  location: string
  features: string
  contact: string
  reward: string
  photo?: File
}
