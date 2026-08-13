import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const verificationTag =
  '<meta name="google-site-verification" content="CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA" />'

test('keeps the exact Google verification meta tag in the homepage head', () => {
  const html = readFileSync('index.html', 'utf8')
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''

  expect(head).toContain(verificationTag)
  expect(html.split(verificationTag)).toHaveLength(2)
})
