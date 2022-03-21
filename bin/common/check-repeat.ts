
export function repeatCheck (values: string[]): boolean {
  let repeatField = false
  values.reduce<string[]>((total, current) => {
    if (repeatField) return total

    if (total.some((i: string) => i === current)) repeatField = true
    total.push(current)
    return total
  }, [])
  return repeatField
}
