export type PetSpecies = 'cat' | 'dog'

export type HealthStatus = 'healthy' | 'ill' | 'pregnant'

export type ScheduleCategory = 'vaccine' | 'deworming'

export interface ScheduleRecord {
  category: ScheduleCategory | 'other'
  date: string
}

export interface ScheduleInput {
  species: PetSpecies
  birthday: string
  healthStatus: HealthStatus
  records: readonly ScheduleRecord[]
  now?: string
}

export interface ScheduleEvent {
  id: string
  category: ScheduleCategory
  label: string
  startDate: string
  endDate: string
  requiresVetConfirmation: true
}

export interface ScheduleResult {
  events: ScheduleEvent[]
  warnings: string[]
  ruleVersion: string
  reviewedAt: string
  scope: string
}
