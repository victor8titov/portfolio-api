import { Client } from 'pg'

export class DatabaseMain {
  _db;
  constructor () {
    this._db = new Client()
  }
}
