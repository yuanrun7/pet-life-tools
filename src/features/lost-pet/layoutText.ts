export function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text]

  return text.split(/\r?\n/).flatMap((paragraph) => {
    if (!paragraph) return ['']

    const lines: string[] = []
    let line = ''
    for (const character of paragraph) {
      const candidate = line + character
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line)
        line = character
      } else {
        line = candidate
      }
    }
    if (line) lines.push(line)
    return lines
  })
}
