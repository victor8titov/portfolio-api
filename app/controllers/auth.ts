import { NextFunction, Request, Response } from 'express'
import { Result, ValidationError, validationResult } from 'express-validator'
import createError from 'http-errors'
import { deleteRefreshTokenByUserName, generateRefreshToken, generateToken, getPayloadToken, getRefreshToken, validPassword, validToken } from '../models/auth'
import { getUserById, getUserByName } from '../models/user'

export async function login (req: Request, res: Response, next: NextFunction) {
  try {
    const message = 'One of the username or password fields is incorrect.'
    const username: string = req.query.username as string
    const password: string = req.query.password as string

    const _user = await getUserByName(username)
    if (!_user) {
      return next(createError(400, message))
    }

    const _checking = await validPassword(password, _user)
    if (!_checking) {
      return next(createError(400, message))
    }

    const token = await generateToken(_user)
    const refreshToken = await generateRefreshToken(_user)
    res.status(200).json({ token, refreshToken })
  } catch (e: any) {
    next(createError(500, 'Error processing data for login.'))
  }
}

export async function logout (req: Request, res: Response, next: NextFunction) {
  try {
    const username: string = req.query.username as string

    await deleteRefreshTokenByUserName(username)
    res.status(200).json({
      username: username,
      message: 'Logout was made successful'
    })
  } catch (e: any) {
    next(createError(500, 'Error processing logout'))
  }
}

export async function refreshToken (req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return next(createError(400, 'Refresh Token is required!'))
    }

    const _checkValidToken = await validToken(refreshToken)
    if (!_checkValidToken.flag) {
      return next(createError(400, _checkValidToken.message || 'Refresh token not valid'))
    }

    const _payload = await getPayloadToken(refreshToken)
    if (!_payload) {
      return next(createError(400, 'Refresh token not valid'))
    }

    const _refreshTokenFromDataBase = await getRefreshToken(_payload.tokenId)
    if (!_refreshTokenFromDataBase) {
      return next(createError(400, 'Refresh token not valid'))
    }

    const _user = await getUserById(_refreshTokenFromDataBase.userId)
    if (!_user) {
      return next(createError(500))
    }

    const newToken = await generateToken(_user)
    const newRefreshToken = await generateRefreshToken(_user)
    res.status(200).json({ token: newToken, refreshToken: newRefreshToken })
  } catch (e: any) {
    next(createError(500, e.message || 'Error processing data'))
  }
}
