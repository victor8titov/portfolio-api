
export enum Language {
  RU = 'ru',
  EN = 'en'
}

export type OptionsRequest = {
  language?: Language
}

export type HomePage = {
  readonly language?: Language
  readonly title?: string
  readonly subtitle?: string
  readonly description?: string
}

export enum TypeErrors {
  INVALID_TYPE = 'Invalid data type',
  EMPTY_FILED = 'Empty field',
  ALREADY_EXIST = 'Already exist'
}

// export type HomePagePostgreSQL = {
//   readonly homepage_id: string
//   readonly language: string
//   readonly title?: string
//   readonly subtitle?: string
//   readonly description?: string
// }
