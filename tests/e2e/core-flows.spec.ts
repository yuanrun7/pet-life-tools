import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

const root = resolve(__dirname, '../..')
const runner = readFileSync(resolve(root, 'tests/e2e/run-core-flows.cjs'), 'utf8')
const wrapper = readFileSync(resolve(root, 'tests/e2e/run-core-flows.ps1'), 'utf8')
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8')

test('wires the executable Edge E2E runner to the documented command', () => {
  expect(packageJson).toContain('test:e2e')
  expect(wrapper).toContain('run-core-flows.cjs')
  for (const marker of ['添加宠物', '生成建议时间线', '将首年预算保存为费用记录', '下载朋友圈海报', '下载备份', '呼吸困难', 'mobile-390x844']) {
    expect(runner).toContain(marker)
  }
})
