import { ImageView } from "./image"

export type ObjectWithLanguage = {
  [K in Language]: string
}

export enum Language {
  RU = 'ru',
  EN = 'en'
}
export type LinkView = {
  readonly name: string
  readonly link: string
  readonly icon?: ImageView
}

export type LinkCreation = Omit<LinkView, 'icon'> & {
  imageId: string
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

export type Options = {
  readonly language?: Language
  readonly page?: number
  readonly pageSize?: number
  readonly sort?: string[] | undefined
}

export type Pagination = {
  page: number
  pageSize: number
  totalPages: number
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
