import { Language } from '../../bin/database/types'

export type ObjectWithLanguage = {
  [K in Language]: string
}
