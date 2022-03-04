import 'dotenv/config'
import { Pool } from 'pg'

const db = new Pool()

async function init () {
  try {
    await db.query(`
      CREATE TABLE homepage (
        language VARCHAR(7) NOT NULL,
        title text,
        subtitle text,
        description text,
        CHECK (language IN ('en', 'ru')),
        PRIMARY KEY (language),
      );`)
    console.log('Table homepage created successful')
  } catch (e) {
    console.log(e)
  } finally {
    db.end()
  }
}

init()
