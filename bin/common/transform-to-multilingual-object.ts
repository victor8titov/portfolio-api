import { Language, ObjectWithLanguage } from '../../app/models/types'

type InputObject = {
  [key: string]: string,
  language: Language
}
export function transformToMultilingualObject (values: InputObject[], languages: Language[], field: string): ObjectWithLanguage {
  const _object: Partial<ObjectWithLanguage> = {}

  for (const language of languages) {
    _object[language] = values.find(i => i.language === language)?.[field] || ''
  }

  return _object as ObjectWithLanguage
}
