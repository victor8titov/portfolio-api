
export type ObjectWithLanguage = {
  [K in Language]: string
}

export enum Language {
  RU = 'ru',
  EN = 'en'
}

export type EventAndDate = {
  date: string
  status: string
}

export type ErrorBody = {
  message: string
  source?: string
  type?: string
}

export type OptionsRequest = {
  readonly language?: Language
  readonly page?: number | undefined
  readonly pageSize?: number | undefined
  readonly sort?: string[] | undefined
}

export enum TypeErrors {
  INVALID_TYPE = 'Invalid data type',
  EMPTY_FILED = 'Empty field',
  ALREADY_EXIST = 'Already exist',
  NO_EXIST = 'No exist',
  AUTHENTICATION = 'Authentication',
  EXTENTSION = 'Extension not supported',
  INCORRECT_VALUE = 'Incorrect value'
}
