
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
  ALREADY_EXIST = 'Already exist',
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
  readonly id: string
  readonly name: string | undefined | null
  readonly suffix: string
  readonly width: number
  readonly height: number | null
}

export type Image = {
  id: string
  name: string
  description: string | null
  width: number | null
  height: number | null
}

// export type HomePagePostgreSQL = {
//   readonly homepage_id: string
//   readonly language: string
//   readonly title?: string
//   readonly subtitle?: string
//   readonly description?: string
// }
