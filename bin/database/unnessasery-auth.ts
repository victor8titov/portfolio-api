import { RefreshToken } from './unnessasery-types'
import { DatabaseMain } from './unessasery-index'

export interface AuthDataInterface {
  updateRefreshToken(token: RefreshToken): Promise<void>
  getRefreshToken(tokenId: string): Promise<RefreshToken | undefined>
  deleteRefreshTokenByUserName(userName: string): Promise<void>
  
  
  createRefreshToken(token: RefreshToken): Promise<void>
}

export class AuthData extends DatabaseMain implements AuthDataInterface {
  async getRefreshToken (tokenId: string): Promise<RefreshToken | undefined> {
    try {
      await this._db.connect()

      const _answer = await this._db.query(`
          SELECT * FROM refresh_tokens WHERE 
          token_id = '${tokenId}';
        `)
      const _length = _answer.rows.length

      if (_length > 1 || _length === 0) return undefined

      const { token_id, user_id, expiry_date } = _answer.rows.shift()
      return { tokenId: token_id, userId: user_id, expiry: expiry_date }
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async createRefreshToken (token: RefreshToken): Promise<void> {
    try {
      await this._db.connect()

      const _answer = await this._db.query(`
          INSERT INTO refresh_tokens (token_id, user_id, expiry_date)
          VALUES ('${token.tokenId}', '${token.userId}', '${token.expiry}');
        `)

      if (!_answer) throw Error('Token creation error')
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async updateRefreshToken (token: RefreshToken): Promise<void> {
    try {
      await this._db.connect()

      await this._db.query(`
          DELETE FROM refresh_tokens WHERE 
          user_id = '${token.userId}';
        `)

      await this._db.query(`
      INSERT INTO refresh_tokens (token_id, user_id, expiry_date)
      VALUES ('${token.tokenId}', '${token.userId}', '${token.expiry}');
        `)
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async deleteRefreshTokenByUserName (userName: string): Promise<void> {
    try {
      await this._db.connect()

      const _answer = await this._db.query(`
          DELETE FROM refresh_tokens WHERE 
          user_id = (
            SELECT user_id FROM users WHERE name = '${userName}'
          );
        `)

      if (!_answer) throw Error('Token delete error')
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
