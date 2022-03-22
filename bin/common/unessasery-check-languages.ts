import { ParsedQs } from 'qs'
import { Language } from '../../app/models/types'

export function checkLanguageField (language: string | string[] | undefined | null | ParsedQs | ParsedQs[]): boolean {
  if (typeof language !== 'string') return false
  if (!language) return false
  return Object.values(Language).some((item) => item === language)
}
