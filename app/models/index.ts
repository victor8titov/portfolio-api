import { Client } from 'pg'

export default class Model {
  protected async connect<T> (callback: (this: Client, client: Client) => Promise<T>) {
    const client = new Client()
    try {
      await client.connect()

      return await callback.call(client, client)
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await client.end()
    }
  }

  protected async connectWitTransaction<T> (callback: (this: Client, client: Client) => Promise<T>) {
    const client = new Client()
    try {
      await client.connect()

      await client.query('BEGIN;')
      const result = await callback.call(client, client)
      await client.query('COMMIT;')
      return result
    } catch (e: any) {
      await client.query('ROLLBACK;')
      console.error(e)
      throw new Error(e.message)
    } finally {
      await client.end()
    }
  }
}
