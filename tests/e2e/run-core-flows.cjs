const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { spawn } = require('node:child_process')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '../..')
const baseUrl = 'http://127.0.0.1:4173'
const artifacts = path.join(__dirname, 'artifacts')
const routes = ['/', '/records/', '/schedule/', '/cost/', '/lost-pet/', '/guide/']
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForServer() {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) return
    } catch {}
    await wait(100)
  }
  throw new Error('Vite preview was not ready')
}

async function audit(page, name, viewport) {
  await page.setViewportSize(viewport)
  for (const pathname of routes) {
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'networkidle' })
    const result = await page.evaluate(() => {
      const overflowing = [...document.querySelectorAll('*')].filter((element) => {
        if (element.closest('.cost-table-wrap, .mobile-nav')) return false
        const rect = element.getBoundingClientRect()
        return rect.right > window.innerWidth + 1 || rect.left < -1
      })
      const nav = document.querySelector('.mobile-nav')
      const navRect = nav?.getBoundingClientRect()
      const obscured = [...document.querySelectorAll('main button, main a, main input, main select, main textarea')]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return navRect && rect.width > 0 && rect.height > 0 && rect.bottom > navRect.top && rect.top < navRect.bottom
        })
        .map((element) => element.outerHTML)
      return {
        overflow: overflowing.length > 0,
        offenders: overflowing.slice(0, 8).map((element) => ({ tag: element.tagName, className: element.className })),
        unlabeled: [...document.querySelectorAll('input:not([type="hidden"]):not([type="file"]), select, textarea')]
          .filter((element) => !element.getAttribute('aria-label') && !element.closest('label') && !(element.id && document.querySelector(`label[for="${element.id}"]`)))
          .map((element) => element.outerHTML),
        obscured,
        navContained: !navRect || navRect.width === 0 || (navRect.left >= -1 && navRect.right <= window.innerWidth + 1),
      }
    })
    assert.equal(result.overflow, false, `${pathname} overflow: ${JSON.stringify(result.offenders)}`)
    assert.deepEqual(result.unlabeled, [], `${pathname} has unlabeled controls`)
    assert.equal(result.navContained, true, `${pathname} mobile navigation container exceeds the viewport`)

    await page.locator('body').focus()
    await page.keyboard.press('Tab')
    const focusResult = await page.evaluate(() => {
      const element = document.activeElement
      if (!(element instanceof HTMLElement) || element === document.body) return { visible: false, tag: 'BODY' }
      const rect = element.getBoundingClientRect()
      const nav = document.querySelector('.mobile-nav')
      const navTop = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : window.innerHeight
      const style = getComputedStyle(element)
      return { visible: rect.top >= 0 && rect.bottom <= navTop && element.matches(':focus-visible') && style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0, tag: element.tagName, top: rect.top, bottom: rect.bottom, navTop, focusVisible: element.matches(':focus-visible'), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth }
    })
    assert.equal(focusResult.visible, true, `${pathname} keyboard focus is not visible or is obscured: ${JSON.stringify(focusResult)}`)
    if (viewport.width <= 760) {
      const lastControl = page.locator('main button:not([disabled]), main a, main input:not([disabled]), main select:not([disabled]), main textarea:not([disabled])').last()
      if (await lastControl.count()) {
        await lastControl.evaluate((element) => element.scrollIntoView({ block: 'center' }))
        const reachable = await lastControl.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          const nav = document.querySelector('.mobile-nav')
          const navTop = nav?.getBoundingClientRect().top ?? window.innerHeight
          return rect.top >= 0 && rect.bottom <= navTop
        })
        assert.equal(reachable, true, `${pathname} last control cannot be scrolled above mobile navigation`)
      }
    }

    const filename = pathname === '/' ? 'home' : pathname.replaceAll('/', '')
    await page.screenshot({ path: path.join(artifacts, `${name}-${filename}.png`), fullPage: true })
  }
}

async function main() {
  await fs.rm(artifacts, { recursive: true, force: true })
  await fs.mkdir(artifacts, { recursive: true })
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd: root })
  let browser
  try {
    await waitForServer()
    browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

    await page.goto(`${baseUrl}/records/`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '添加宠物' }).click()
    await page.getByLabel('名称').fill('团子')
    await page.getByLabel('生日').fill('2024-01-01')
    await page.getByRole('button', { name: '保存宠物' }).click()
    await page.getByText('团子', { exact: true }).waitFor()

    await page.goto(`${baseUrl}/schedule/`, { waitUntil: 'networkidle' })
    await page.locator('.schedule-form input[type="date"]').fill('2024-01-01')
    await page.getByRole('button', { name: '生成建议时间线' }).click()
    const eventTitle = (await page.locator('.schedule-event h3').first().textContent())?.trim()
    assert.ok(eventTitle, 'schedule did not generate an event')
    await page.locator('.schedule-results .save-target select').selectOption({ label: '团子' })
    await page.getByRole('button', { name: '保存到档案' }).click()
    await page.getByText('已保存到所选宠物档案。').waitFor()

    await page.goto(`${baseUrl}/cost/`, { waitUntil: 'networkidle' })
    await page.locator('.cost-table input[type="number"]').first().fill('321')
    await page.locator('.cost-page .save-target select').selectOption({ label: '团子' })
    await page.getByRole('button', { name: '将首年预算保存为费用记录' }).click()
    await page.getByText('已保存到所选宠物档案。').waitFor()

    await page.goto(`${baseUrl}/lost-pet/`, { waitUntil: 'networkidle' })
    await page.getByLabel('宠物名称').fill('团子')
    await page.getByLabel('走失时间').fill('2026-07-23T09:30')
    await page.getByLabel('走失地点').fill('公园东门')
    await page.getByLabel('联系方式').fill('13800000000')
    await page.getByLabel('特征').fill('橘白相间，佩戴蓝色项圈')
    const posterDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: '下载朋友圈海报' }).click()
    const posterPath = path.join(artifacts, 'poster.png')
    await (await posterDownload).saveAs(posterPath)
    const poster = await fs.readFile(posterPath)
    assert.ok(poster.length > 10_000, 'poster download is unexpectedly small')
    assert.deepEqual([...poster.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'poster is not a PNG')

    await page.goto(`${baseUrl}/records/`, { waitUntil: 'networkidle' })
    await page.getByText(eventTitle, { exact: false }).waitFor()
    await page.getByText('养宠首年预算', { exact: false }).waitFor()
    const backupDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: '下载备份' }).click()
    const backupPath = path.join(artifacts, 'pet-records-backup.json')
    await (await backupDownload).saveAs(backupPath)
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'))
    assert.ok(backupData.healthEvents.length > 0, 'backup is missing schedule events')
    assert.ok(backupData.expenses.some((item) => item.title === '养宠首年预算'), 'backup is missing the saved cost')
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    page.once('dialog', (dialog) => dialog.accept())
    await page.locator('input[type="file"]').setInputFiles(backupPath)
    await page.getByText('团子', { exact: true }).waitFor()
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('pet-lifecycle-toolkit:records:v1')))
    assert.ok(restored.healthEvents.some((item) => item.title === eventTitle), 'restored data is missing the schedule event')
    assert.ok(restored.expenses.some((item) => item.title === '养宠首年预算'), 'restored data is missing the saved cost')

    await page.goto(`${baseUrl}/guide/`, { waitUntil: 'networkidle' })
    await page.locator('#guide-query').fill('呼吸困难')
    await page.getByRole('button', { name: '检索本地资料' }).click()
    await page.locator('.risk-banner[role="alert"]').waitFor()

    await audit(page, 'desktop-1440x1000', { width: 1440, height: 1000 })
    await audit(page, 'mobile-390x844', { width: 390, height: 844 })
    assert.deepEqual(errors, [], `browser errors: ${errors.join('\n')}`)
    console.log(`PASS: real Edge workflows and 12 screenshots in ${artifacts}`)
  } finally {
    if (browser) await browser.close()
    server.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
