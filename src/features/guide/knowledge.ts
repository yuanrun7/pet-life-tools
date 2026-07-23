export type SupportedSpecies = 'cat' | 'dog' | 'both'

export type KnowledgeEntry = {
  id: string
  title: string
  summary: string
  keywords: readonly string[]
  species: SupportedSpecies
  source: {
    organization: string
    guide: string
    note: string
  }
  updatedAt: string
}

export const knowledgeEntries: readonly KnowledgeEntry[] = [
  {
    id: 'dental-care',
    title: '日常口腔护理',
    summary: '了解猫狗日常口腔检查与清洁的基础注意事项；出现疼痛、出血或拒食时请咨询执业兽医。',
    keywords: ['口腔清洁', '猫咪刷牙', '狗狗刷牙', '牙齿护理', '日常口臭观察'],
    species: 'both',
    source: {
      organization: '美国兽医牙科学院',
      guide: '宠物牙科家庭护理指南',
      note: '面向宠物主人阅读的日常口腔健康说明。',
    },
    updatedAt: '2026-07-01',
  },
  {
    id: 'coat-care',
    title: '被毛与皮肤日常护理',
    summary: '整理梳毛、洗护与皮肤观察的日常要点，帮助及时发现需要咨询兽医的变化。',
    keywords: ['日常梳毛', '毛发护理', '皮肤护理', '多久洗澡'],
    species: 'both',
    source: {
      organization: '世界小动物兽医协会',
      guide: '伴侣动物基础健康护理资料',
      note: '供主人识别日常护理与就诊咨询边界的阅读材料。',
    },
    updatedAt: '2026-07-01',
  },
  {
    id: 'cat-litter',
    title: '猫砂盆与排泄观察',
    summary: '了解猫砂盆清洁和排泄记录的观察重点；排尿困难或明显疼痛请尽快联系动物医院。',
    keywords: ['猫砂盆', '排尿观察', '排便观察', '猫咪如厕'],
    species: 'cat',
    source: {
      organization: '国际猫病护理组织',
      guide: '猫咪友好环境与如厕护理指南',
      note: '帮助猫主人理解环境管理和排泄行为观察。',
    },
    updatedAt: '2026-07-01',
  },
  {
    id: 'dog-exercise',
    title: '犬只日常活动安排',
    summary: '了解按年龄、体型和健康状况安排日常活动的原则；活动后不适请咨询执业兽医。',
    keywords: ['狗狗遛狗', '狗狗运动量', '日常散步', '活动量安排'],
    species: 'dog',
    source: {
      organization: '世界小动物兽医协会',
      guide: '犬只健康生活方式建议',
      note: '供宠物主人阅读的活动与健康观察概览。',
    },
    updatedAt: '2026-07-01',
  },
]
