import 'dotenv/config'
import { Pool } from 'pg'
import crypto from 'crypto'

const db = new Pool()

async function initHomePageTable () {
  try {
    await db.query('DROP TABLE IF EXISTS homepage;')

    await db.query(`
      CREATE TABLE homepage (
        language VARCHAR(7) NOT NULL,
        title text,
        subtitle text,
        description text,
        CHECK (language IN ('en', 'ru')),
        PRIMARY KEY (language)
      );`)
    console.log('Table homepage created successful')
  } catch (e) {
    console.log(e)
  }
}

async function initUsersTable () {
  try {
    await db.query('DROP TABLE IF EXISTS users CASCADE;')

    await db.query(`
      CREATE TABLE users (
        user_id serial NOT NULL,
        name VARCHAR(10) NOT NULL,
        email VARCHAR(30) NOT NULL,
        password text NOT NULL,
        salt text NOT NULL,
        PRIMARY KEY (user_id),
        UNIQUE (email),
        UNIQUE (name)
      );`)
    console.log('Table users created successful')

    const salt = crypto.randomBytes(16).toString('hex')
    const password = process.env.PASSWORD_ADMIN
    if (!password) return
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'SHA1').toString('hex')
    const user = process.env.USER_ADMIN

    if (!user) return
    await db.query(`
        INSERT INTO users (name, email, password, salt)
        VALUES ('${user}', 'victor8titov@gmail.com', '${hash}', '${salt}');
    `)
    console.log('added super user')
  } catch (e) {
    console.log(e)
  }
}

async function initRefreshTokenTable () {
  try {
    await db.query('DROP TABLE IF EXISTS refreshTokens;')

    await db.query(`
      CREATE TABLE refreshTokens (
        token_id text NOT NULL,
        user_id integer NOT NULL,
        expiry_date timestamp NOT NULL,
        PRIMARY KEY (token_id),
        UNIQUE ( user_id ),
        FOREIGN KEY ( user_id )
          REFERENCES users ( user_id )
      );
    `)

    console.log('added refreshToken table')
  } catch (e) {
    console.log(e)
  }
}

(async function () {
  await initUsersTable()
  await initRefreshTokenTable()
  await initHomePageTable()
  await db.end()
  console.log('closed postgres')
})()
