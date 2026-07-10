/** Winziger Klassen-Merger — nimmt Strings, false/undefined werden verworfen. */
export type ClassValue = string | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter((v): v is string => typeof v === 'string' && v.length > 0).join(' ')
}
