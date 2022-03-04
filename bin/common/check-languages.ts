import { Language } from '../database/types'
import { ParsedQs } from 'qs'

export function checkLanguageField (language: string | string[] | undefined | null | ParsedQs | ParsedQs[]): boolean {
  if (!language) return false
  return Object.values(Language).some((item) => item === language)
}
