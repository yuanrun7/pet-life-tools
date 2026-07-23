import type { PageKey } from './pageMeta'
import { pageMeta } from './pageMeta'
import { CostPage } from '../features/cost/CostPage'
import { RecordsPage, saveScheduleEvents } from '../features/records/RecordsPage'
import { createId } from '../features/records/PetEditor'
import { loadStore, saveStore } from '../features/records/storage'
import { resolvePetTarget } from '../features/records/target'
import { SchedulePage } from '../features/schedule/SchedulePage'
import { LostPetPage } from '../features/lost-pet/LostPetPage'
import { GuidePage } from '../features/guide/GuidePage'
import { HomePage } from '../features/home/HomePage'

const tools: ReadonlyArray<{ key: PageKey; label: string; summary: string }> = [
  { key: 'schedule', label: '宠物日程', summary: '喂食、用药与复诊，按时不慌乱。' },
  { key: 'cost', label: '养宠花费', summary: '看清日常开销，也为意外留余地。' },
  { key: 'lost-pet', label: '走失寻宠', summary: '紧急时刻，照着清单一步步行动。' },
  { key: 'records', label: '健康档案', summary: '疫苗、驱虫与就诊记录集中整理。' },
  { key: 'guide', label: '照护指南', summary: '陪伴猫狗走过不同生命阶段。' },
]

const navigation = [{ key: 'home' as const, label: '首页' }, ...tools.map(({ key, label }) => ({ key, label }))]
const hrefFor = (key: PageKey) => key === 'home' ? '/' : `/${key}/`

function Navigation({ page, mobile = false }: { page: PageKey; mobile?: boolean }) {
  return <nav className={mobile ? 'mobile-nav' : 'desktop-nav'} aria-label={mobile ? '移动端主导航' : '主导航'}>{navigation.map((item) => <a key={item.key} href={hrefFor(item.key)} aria-current={page === item.key ? 'page' : undefined}>{item.label}</a>)}</nav>
}

export function App({ page }: { page: PageKey }) {
  const meta = pageMeta[page]
  const store = loadStore()
  const pets = store.pets

  function saveScheduleToRecords(petId: string, events: ReadonlyArray<{ id: string; category: string; label: string; startDate: string }>) {
    const store = loadStore()
    const target = resolvePetTarget(store, petId)
    return target.ok ? saveStore(saveScheduleEvents(store, target.pet.id, events)).ok : false
  }

  function saveCostToRecords(petId: string, amount: number) {
    const store = loadStore()
    const target = resolvePetTarget(store, petId)
    if (!target.ok) return false
    return saveStore({ ...store, expenses: [...store.expenses, { id: createId(), petId: target.pet.id, date: new Date().toISOString().slice(0, 10), title: '养宠首年预算', amount, notes: '由花费计算器保存' }] }).ok
  }

  return <div className="site-shell">
    <header className="site-header"><a className="brand" href="/" aria-label="猫狗生活工具箱首页"><span className="brand-mark" aria-hidden="true">爪</span><span>猫狗生活工具箱</span></a><Navigation page={page} /></header>
    <main>
      <section className="hero"><p className="eyebrow">{meta.eyebrow}</p><h1>{meta.heading}</h1><p className="hero-copy">{meta.description}</p><p className="species-note">专为猫与狗设计 · 无需登录 · 数据留在本地</p></section>
      {page === 'home' ? <HomePage store={store} /> : page === 'schedule' ? <SchedulePage pets={pets} onSaveEvents={saveScheduleToRecords} /> : page === 'cost' ? <CostPage pets={pets} onSaveExpense={saveCostToRecords} /> : page === 'lost-pet' ? <LostPetPage /> : page === 'records' ? <RecordsPage /> : page === 'guide' ? <GuidePage /> : <section className="tool-placeholder"><p className="eyebrow">工具入口已就位</p><h2>从这里开始整理</h2><p>页面外壳已经就位，具体功能将在后续步骤中接入。</p><a className="text-link" href="/">返回查看全部工具 →</a></section>}
      <section className="promise"><div><p className="eyebrow">纯工具承诺</p><h2>少一点打扰，多一点安心</h2></div><ul><li><strong>没有广告</strong><span>不让商业内容挤占注意力。</span></li><li><strong>没有追踪</strong><span>不分析使用行为。</span></li><li><strong>本地保存</strong><span>记录只留在当前设备中。</span></li></ul></section>
    </main>
    <footer className="site-footer"><p><strong>隐私说明：</strong>本工具无需账户，数据仅保存在本地。</p><p><strong>医疗声明：</strong>内容仅供日常整理与参考，不能替代专业兽医诊疗。</p><p className="copyright">© 2026 猫狗生活工具箱</p></footer>
    <Navigation page={page} mobile />
  </div>
}
