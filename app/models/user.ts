import { User } from '../../bin/database/types'
import { UserData, UserDataInterface } from '../../bin/database/user'

type Options = {
  userId?: string
  userName?: string
}

export async function getUser (options: Options): Promise<User | undefined> {
  const { userId, userName } = options

  if (!userId && !userName) throw new Error('getUser method did not receive any parameter to search for data')

  const _db: UserDataInterface = new UserData()

  if (userId) {
    return _db.getUserById(userId)
  }

  if (userName) {
    return _db.getUserByName(userName)
  }
}

// export async function createUser() {}

// export async function updateUser() {}
