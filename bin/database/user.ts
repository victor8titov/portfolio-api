import { User } from './types'
import { DatabaseMain } from '.'

export interface UserDataInterface {
  getUserById(userId: string): Promise<User | undefined>
  getUserByName(userName: string): Promise<User | undefined>
}

export class UserData extends DatabaseMain implements UserDataInterface {
  protected _formattingUserView (userData: { [key: string]: string } | undefined): User | undefined {
    if (!userData) return undefined
    const { user_id, name, email, password, salt } = userData
    return {
      id: user_id,
      name,
      email,
      password,
      salt
    }
  }

  async getUserById (userId: string): Promise<User | undefined> {
    try {
      await this._db.connect()

      const _answer = await this._db.query(`
        SELECT * FROM users WHERE 
          user_id = '${userId}';
        `)

      return this._formattingUserView(_answer.rows.shift())
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async getUserByName (userName: string): Promise<User | undefined> {
    try {
      await this._db.connect()

      const _answer = await this._db.query(`
        SELECT * FROM users WHERE 
        name = '${userName}';
        `)

      return this._formattingUserView(_answer.rows.shift())
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
