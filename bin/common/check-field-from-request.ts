
export function checkFieldFromRequest (value: any): boolean {
  if (typeof value !== 'string' || !value?.length) {
    return false
  }
  return true
}
