import { Client, QueryConfig, QueryResult, QueryResultRow } from 'pg'

export class Postgresql {
  private _client: Client;

  constructor () {
    this._client = new Client()
  }

  async query<R extends QueryResultRow = any, I extends any[] = any[]> (
    queryTextOrConfig: string | QueryConfig<I>,
    values?: I): Promise<QueryResult<R> | undefined> {
    try {
      await this._client.connect()
      const _answer = await this._client.query(queryTextOrConfig, values)
      return _answer
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  async end (): Promise<void> {
    await this._client.end()
  }
}
