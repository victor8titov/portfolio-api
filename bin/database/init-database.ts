import 'dotenv/config'
import { Pool } from 'pg'
import crypto from 'crypto'

const db = new Pool()

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
    await db.query('DROP TABLE IF EXISTS refresh_tokens;')

    await db.query(`
      CREATE TABLE refresh_tokens (
        token_id text NOT NULL,
        user_id integer NOT NULL,
        expiry_date timestamp NOT NULL,
        PRIMARY KEY (token_id),
        UNIQUE ( user_id ),
        FOREIGN KEY ( user_id )
          REFERENCES users ( user_id )
      );
    `)

    console.log('added refresh Token table')
  } catch (e) {
    console.log(e)
  }
}

async function initTemplatesImage () {
  try {
    await db.query('DROP TABLE IF EXISTS templates_image CASCADE;')

    await db.query(`
      CREATE TABLE templates_image (
        name VARCHAR(8) NOT NULL,
        width SMALLINT,
        height SMALLINT,
        PRIMARY KEY (name),
        UNIQUE (width, height)
      );
    `)

    await db.query(`
      INSERT INTO templates_image (name, width, height)
        VALUES 
          ('original', null, null),
          ('mid', 800, null),
          ('small', 300, 300);
    `)

    console.log('added templates_image table successful')
  } catch (e) {
    console.error(e)
  }
}

async function initImagesTable () {
  try {
    await db.query('DROP TABLE IF EXISTS images')

    await db.query(`
      CREATE TABLE images (
        id serial NOT NULL,
        image_id VARCHAR(10) NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        width SMALLINT,
        height SMALLINT,
        template_name VARCHAR(8) DEFAULT '',
        PRIMARY KEY (id),
        UNIQUE (image_id, name),
        FOREIGN KEY ( template_name )
          REFERENCES templates_image ( name )
          ON DELETE SET NULL
      );
    `)

    console.log('added images table successful')
  } catch (e) {
    console.error(e)
  }
}

async function initHomePageTable () {
  try {
    await db.query('DROP TABLE IF EXISTS homepage;')

    await db.query(`
      CREATE TABLE homepage (
        language VARCHAR(7) NOT NULL,
        title text DEFAULT '',
        subtitle text DEFAULT '',
        description text DEFAULT '',
        image VARCHAR(10) DEFAULT '',
        CHECK (language IN ('en', 'ru')),
        PRIMARY KEY (language)
      );`)
    console.log('Table homepage created successful')
  } catch (e) {
    console.log(e)
  }
}

(async function () {
  await initUsersTable()
  await initRefreshTokenTable()
  await initTemplatesImage()
  await initImagesTable()
  await initHomePageTable()
  await db.end()
  console.log('closed postgres')
})()
