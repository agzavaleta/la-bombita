export type NormalizedPrizeName = {
  name: string
  normalizedName: string
}

export function normalizePrizeName(value: string): NormalizedPrizeName {
  const name = value.trim()

  return {
    name,
    normalizedName: name.toLowerCase(),
  }
}
