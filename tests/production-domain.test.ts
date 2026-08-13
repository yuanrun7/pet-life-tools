import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const origin = 'https://pet-life-tools.netlify.app'
const pages = [
  ['index.html', '/'],
  ['schedule/index.html', '/schedule/'],
  ['cost/index.html', '/cost/'],
  ['lost-pet/index.html', '/lost-pet/'],
  ['records/index.html', '/records/'],
  ['guide/index.html', '/guide/'],
] as const

test('uses the final Netlify origin for every canonical and Open Graph URL', () => {
  for (const [file, path] of pages) {
    const html = readFileSync(file, 'utf8')
    const url = `${origin}${path}`

    expect(html).toContain(`<link rel="canonical" href="${url}" vite-ignore />`)
    expect(html).toContain(`<meta property="og:url" content="${url}" />`)
  }
})

test('publishes the final Netlify origin in robots and sitemap without the old host', () => {
  const robots = readFileSync('public/robots.txt', 'utf8')
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')

  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`)
  for (const [, path] of pages) {
    expect(sitemap).toContain(`<loc>${origin}${path}</loc>`)
  }
  expect(`${robots}\n${sitemap}`).not.toContain('pet-life-tools.vercel.app')
})
