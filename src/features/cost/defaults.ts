import type { CostItem } from './types'

export type PetSpecies = 'cat' | 'dog'

export interface CostTemplate {
  species: PetSpecies
  isExample: true
  lifespanYears: number
  items: CostItem[]
}

const templates: Record<PetSpecies, CostTemplate> = {
  cat: {
    species: 'cat',
    isExample: true,
    lifespanYears: 15,
    items: [
      { id: 'adoption', label: '领养或购置准备', amount: 300, cadence: 'upfront', necessity: 'essential' },
      { id: 'home-setup', label: '基础用品', amount: 850, cadence: 'upfront', necessity: 'essential' },
      { id: 'food', label: '主粮与日常消耗', amount: 260, cadence: 'monthly', necessity: 'essential' },
      { id: 'litter', label: '猫砂与清洁', amount: 110, cadence: 'monthly', necessity: 'essential' },
      { id: 'checkup', label: '体检与常规护理', amount: 900, cadence: 'annual', necessity: 'essential' },
      { id: 'reserve', label: '医疗备用金', amount: 2000, cadence: 'reserve', necessity: 'essential' },
      { id: 'toys', label: '玩具与环境丰富', amount: 80, cadence: 'monthly', necessity: 'optional' },
      { id: 'grooming', label: '美容与纪念消费', amount: 300, cadence: 'annual', necessity: 'optional' },
    ],
  },
  dog: {
    species: 'dog',
    isExample: true,
    lifespanYears: 12,
    items: [
      { id: 'adoption', label: '领养或购置准备', amount: 500, cadence: 'upfront', necessity: 'essential' },
      { id: 'home-setup', label: '基础用品', amount: 1200, cadence: 'upfront', necessity: 'essential' },
      { id: 'food', label: '主粮与日常消耗', amount: 420, cadence: 'monthly', necessity: 'essential' },
      { id: 'supplies', label: '遛狗与清洁用品', amount: 90, cadence: 'monthly', necessity: 'essential' },
      { id: 'checkup', label: '体检与常规护理', amount: 1200, cadence: 'annual', necessity: 'essential' },
      { id: 'reserve', label: '医疗备用金', amount: 2500, cadence: 'reserve', necessity: 'essential' },
      { id: 'training', label: '训练与活动', amount: 180, cadence: 'monthly', necessity: 'optional' },
      { id: 'grooming', label: '美容与纪念消费', amount: 600, cadence: 'annual', necessity: 'optional' },
    ],
  },
}

export function getCostTemplate(species: PetSpecies): CostTemplate {
  const template = templates[species]
  return { ...template, items: template.items.map((item) => ({ ...item })) }
}
