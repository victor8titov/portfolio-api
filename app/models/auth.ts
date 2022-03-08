import { RefreshToken, RefreshTokenPayload, TokenPayload, User } from '../../bin/database/types'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { AuthData, AuthDataInterface } from '../../bin/database/auth'

export async function validPassword (password: string, user: User): Promise<boolean> {
  return (new Promise((resolve, reject) => {
    crypto.pbkdf2(password, user.salt, 1000, 64, 'SHA1', (err, hashedPassword) => {
      if (err) reject(err)

      if (user.password !== hashedPassword.toString('hex')) {
        return resolve(false)
      }

      return resolve(true)
    })
  }))
}

export async function validToken (token: string): Promise<{flag: boolean, message?: string}> {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET

    if (!secret) return reject(new Error('No data for checking refresh token'))

    jwt.verify(token, secret, function (err, decoded) {
      if (err) return resolve({ flag: false, message: err.message })

      decoded ? resolve({ flag: true }) : resolve({ flag: false })
    })
  })
}

export async function getPayloadToken (token: string): Promise<RefreshTokenPayload | undefined> {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET

    if (!secret) return reject(new Error('No data for checking refresh token'))

    jwt.verify(token, secret, function (err, decoded) {
      if (err) reject(err)

      resolve(decoded as RefreshTokenPayload | undefined)
    })
  })
}

export async function generateToken (user: User): Promise<string> {
  const { id, name } = user

  if (!process.env.JWT_SECRET) throw new Error('No secret phrase for token formation')

  const _payload: TokenPayload = { userId: id, userName: name }

  return jwt.sign(
    _payload, process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRATION || '1200') }
  )
}

export async function generateRefreshToken (user: User): Promise<string> {
  if (!process.env.JWT_SECRET) throw new Error('No secret phrase for token formation')

  const tokenId = uuidv4()

  const _db: AuthDataInterface = new AuthData()

  const expiredAt = new Date()
  expiredAt.setSeconds(expiredAt.getSeconds() + parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400'))

  await _db.updateRefreshToken({
    userId: user.id,
    tokenId,
    expiry: expiredAt.toUTCString()
  })

  const _payload: RefreshTokenPayload = { tokenId }

  return jwt.sign(
    _payload, process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400') }
  )
}

export async function getRefreshToken (tokenId: string): Promise<RefreshToken | undefined> {
  const _db: AuthDataInterface = new AuthData()
  return _db.getRefreshToken(tokenId)
}

export async function deleteRefreshTokenByUserName (userName: string): Promise<void> {
  const _db: AuthDataInterface = new AuthData()
  return _db.deleteRefreshTokenByUserName(userName)
}
