
export enum Language {
  RU = 'ru',
  EN = 'en'
}

export type OptionsRequest = {
  language?: Language
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

export type User = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly password: string
  readonly salt: string
}

export type TokenPayload = {
  readonly userId: string
  readonly userName: string
}

export type RefreshTokenPayload = {
  readonly tokenId: string
}

export type RefreshToken = {
  readonly tokenId: string
  readonly userId: string
  readonly expiry: string
}

export type TemplateImage = {
  readonly name: string
  readonly width: number
  readonly height?: number | null
}

export type Image = {
  readonly id: string
  readonly name: string
  readonly description?: string | null
  readonly width?: number | null
  readonly height?: number | null
  readonly templateName?: string | null
  readonly url: string
}

export type HomePage = {
  readonly language: Language
  readonly title?: string
  readonly subtitle?: string
  readonly description?: string
  readonly imageId?: string | null
  readonly image?: string | null
  readonly images?: Omit<Image, 'id' | 'name'>
}
