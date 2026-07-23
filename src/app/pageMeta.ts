export type PageKey = 'home' | 'schedule' | 'cost' | 'lost-pet' | 'records' | 'guide'

export interface PageMeta {
  title: string
  description: string
  canonical: string
  eyebrow: string
  heading: string
  faq: readonly [
    { question: string; answer: string },
    { question: string; answer: string },
  ]
}

export const pageMeta: Record<PageKey, PageMeta> = {
  home: {
    title: '猫狗生活工具箱｜本地、轻量、无追踪',
    description: '为猫狗家庭准备的日程、花费、寻宠、档案与照护指南工具，数据仅保存在本地。',
    canonical: '/',
    eyebrow: '陪伴每一个生活阶段',
    heading: '把猫狗生活里的重要小事，安稳放在一起',
    faq: [
      { question: '这个工具箱支持哪些宠物？', answer: '目前只面向猫和狗。' },
      { question: '数据会上传到服务器吗？', answer: '不会，数据只保存在你的设备本地。' },
    ],
  },
  schedule: {
    title: '宠物日程｜猫狗生活工具箱',
    description: '集中安排猫狗的喂食、用药、驱虫、洗护和复诊提醒。',
    canonical: '/schedule/',
    eyebrow: '规律照护',
    heading: '宠物日程',
    faq: [
      { question: '日程适合记录什么？', answer: '可用于整理喂食、用药、驱虫、洗护和复诊等事项。' },
      { question: '日程会同步到云端吗？', answer: '不会，日程数据仅保存在当前设备。' },
    ],
  },
  cost: {
    title: '养宠花费｜猫狗生活工具箱',
    description: '在本地记录猫狗日常、医疗与用品花费，清楚了解养宠支出。',
    canonical: '/cost/',
    eyebrow: '从容规划',
    heading: '养宠花费',
    faq: [
      { question: '可以记录哪些花费？', answer: '可整理食品、用品、洗护和医疗等猫狗相关支出。' },
      { question: '花费记录是否私密？', answer: '是，记录不会上传，只保存在当前设备。' },
    ],
  },
  'lost-pet': {
    title: '走失寻宠｜猫狗生活工具箱',
    description: '快速整理猫狗走失信息与寻宠行动清单，为紧急时刻提供清晰指引。',
    canonical: '/lost-pet/',
    eyebrow: '紧急支持',
    heading: '走失寻宠',
    faq: [
      { question: '发现宠物走失后先做什么？', answer: '先确认最后出现地点和时间，再联系附近人员并开始分区寻找。' },
      { question: '寻宠信息会自动发布吗？', answer: '不会，本工具只在本地协助整理信息。' },
    ],
  },
  records: {
    title: '健康档案｜猫狗生活工具箱',
    description: '在本地整理猫狗的基础信息、疫苗、驱虫和就诊记录。',
    canonical: '/records/',
    eyebrow: '安心留存',
    heading: '健康档案',
    faq: [
      { question: '健康档案可以保存什么？', answer: '可整理基础信息、疫苗、驱虫和就诊记录。' },
      { question: '档案能代替医院病历吗？', answer: '不能，本工具仅作个人整理，请以兽医和医院病历为准。' },
    ],
  },
  guide: {
    title: '照护指南｜猫狗生活工具箱',
    description: '按猫狗的不同生命阶段整理日常照护要点与就医提醒。',
    canonical: '/guide/',
    eyebrow: '温和陪伴',
    heading: '照护指南',
    faq: [
      { question: '指南涵盖哪些阶段？', answer: '内容围绕猫狗幼年、成年和老年阶段的日常照护。' },
      { question: '指南能替代兽医建议吗？', answer: '不能，健康异常或紧急情况请及时咨询专业兽医。' },
    ],
  },
}

export function resolvePage(pathname: string): PageKey {
  const segment = pathname.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')

  if (segment === 'schedule' || segment === 'cost' || segment === 'lost-pet' || segment === 'records' || segment === 'guide') {
    return segment
  }

  return 'home'
}
