import { Client } from 'pg'

export type User = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly password: string
  readonly salt: string
}

export async function getUserById (id: string): Promise<User | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT user_id as id, name, email, password, salt FROM users 
        WHERE user_id = '${id}';
      `)

    return rows.shift() || undefined
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getUserByName (name: string): Promise<User | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT user_id as id, name, email, password, salt FROM users 
        WHERE name = '${name}';
      `)

    return rows.shift() || undefined
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
