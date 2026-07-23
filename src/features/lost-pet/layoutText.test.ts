import { describe, expect, it } from 'vitest'

import { wrapText } from './layoutText'

function context(widths: Record<string, number>) {
  return { measureText: (text: string) => ({ width: [...text].reduce((sum, character) => sum + (widths[character] ?? 1), 0) }) } as CanvasRenderingContext2D
}

describe('wrapText', () => {
  it('wraps Chinese copy without requiring spaces', () => {
    const canvas = context({})
    const lines = wrapText(canvas, '走失地点：公园北门', 4)

    expect(lines).toEqual(['走失地点', '：公园北', '门'])
    expect(lines.every((line) => canvas.measureText(line).width <= 4)).toBe(true)
  })

  it('breaks an overlong contact string into readable lines', () => {
    expect(wrapText(context({}), '138001380001380013800', 6)).toEqual(['138001', '380001', '380013', '800'])
  })

  it('preserves manual line breaks', () => {
    expect(wrapText(context({}), '第一行\n第二行', 10)).toEqual(['第一行', '第二行'])
  })
})
