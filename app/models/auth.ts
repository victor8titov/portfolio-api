import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Client } from 'pg'
import { User } from './user'

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

type RefreshTokenLineDB = {
  token_id: string
  user_id: string
  expiry_date: string
}

export async function validatePassword (password: string, user: User): Promise<boolean> {
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
  const db = new Client()
  try {
    if (!process.env.JWT_SECRET) throw new Error('No secret phrase for token formation')

    const userId = user.id

    const tokenId = uuidv4()

    const expiry = new Date()
    expiry.setSeconds(
      expiry.getSeconds() + parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400')
    )

    await db.connect()

    await db.query(`
        DELETE FROM refresh_tokens WHERE 
        user_id = '${userId}';
      `)

    await db.query(`
      INSERT INTO refresh_tokens 
        (token_id, user_id, expiry_date)
        VALUES 
        ('${tokenId}', '${userId}', '${expiry.toISOString()}');
      `)

    const _payload: RefreshTokenPayload = { tokenId }

    return jwt.sign(
      _payload, process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400') }
    )
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getRefreshToken (tokenId: string): Promise<RefreshToken | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<RefreshTokenLineDB>(`
          SELECT token_id, user_id, expiry_date FROM refresh_tokens WHERE 
          token_id = '${tokenId}';
        `)

    if (rows.length > 1 || rows.length === 0) return undefined

    const _token = rows.shift()
    if (!_token) return undefined

    const { user_id: userId, expiry_date: expiry } = _token
    return { tokenId, userId, expiry }
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function deleteRefreshTokenByUserName (userName: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    const _answer = await db.query(`
        DELETE FROM refresh_tokens WHERE 
        user_id = (
          SELECT user_id FROM users WHERE name = '${userName}'
        );
      `)

    if (!_answer) throw Error('Token delete error')
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
