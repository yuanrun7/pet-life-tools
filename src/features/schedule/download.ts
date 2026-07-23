export function scheduleObjectUrlRelease(url: string) {
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
