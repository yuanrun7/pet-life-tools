import type { PetStore } from '../records/types'
import { getUpcoming } from './upcoming'

const quickLinks = [
  { href: '/records/', title: '更新健康档案', detail: '补充体重、疫苗和就诊信息' },
  { href: '/schedule/', title: '安排照护日程', detail: '生成下一阶段的照护提醒' },
  { href: '/cost/', title: '记录养宠花费', detail: '查看日常支出的估算' },
]

const tools = [
  { href: '/schedule/', title: '宠物日程', detail: '喂食、用药与复诊，按时不慌乱。' },
  { href: '/cost/', title: '养宠花费', detail: '看清日常开销，也为意外留余地。' },
  { href: '/lost-pet/', title: '走失寻宠', detail: '紧急时刻，照着清单一步步行动。' },
  { href: '/records/', title: '健康档案', detail: '疫苗、驱虫与就诊记录集中整理。' },
  { href: '/guide/', title: '照护指南', detail: '陪伴猫狗走过不同生命阶段。' },
]

export function HomePage({ store }: { store: PetStore }) {
  if (store.pets.length === 0) {
    return <section className="tool-grid" aria-labelledby="tools-title">
      <div className="section-heading"><p className="eyebrow">五个实用入口</p><h2 id="tools-title">需要时，打开刚好的工具</h2></div>
      <div className="cards">{tools.map((tool, index) => <a className="tool-card" href={tool.href} key={tool.href}><span className="card-number">0{index + 1}</span><h3>{tool.title}</h3><p>{tool.detail}</p><span className="card-link">进入工具 →</span></a>)}</div>
    </section>
  }

  const reminders = getUpcoming(store, new Date(), 3)
  const pets = new Map(store.pets.map((pet) => [pet.id, pet.name]))
  return <section className="home-dashboard" aria-labelledby="dashboard-title">
    <div className="section-heading"><p className="eyebrow">今天的照护安排</p><h2 id="dashboard-title">先处理最近的提醒，再记录新的日常</h2></div>
    <div className="home-dashboard-grid">
      <section className="upcoming-list" aria-labelledby="upcoming-title"><h3 id="upcoming-title">近期提醒</h3>{reminders.length ? <ol>{reminders.map((reminder) => <li key={reminder.id}><time dateTime={reminder.date}>{reminder.date}</time><div><strong>{reminder.title}</strong><span>{pets.get(reminder.petId) ?? '宠物'}{reminder.notes ? ` · ${reminder.notes}` : ''}</span></div></li>)}</ol> : <p>暂无未来提醒。可以先安排下一次照护日程。</p>}<a className="text-link" href="/schedule/">管理日程 →</a></section>
      <section className="quick-links" aria-labelledby="quick-links-title"><h3 id="quick-links-title">快捷记录</h3>{quickLinks.map((link) => <a href={link.href} key={link.href}><strong>{link.title}</strong><span>{link.detail}</span></a>)}</section>
    </div>
  </section>
}
