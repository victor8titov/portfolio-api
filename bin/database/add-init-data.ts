import 'dotenv/config'
import { Pool } from 'pg'
import crypto from 'crypto'

const db = new Pool()

async function insertLanguages () {
  try {
    await db.query('DELETE FROM languages;')
    await db.query(`
      INSERT INTO languages (language)
      VALUES
        ('ru'),
        ('en');
    `)
  } catch (e) {
    console.log(e)
  }
}

async function createSuperUser () {
  try {
    const salt = crypto.randomBytes(16).toString('hex')
    const password = process.env.PASSWORD_ADMIN
    if (!password) return
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'SHA1').toString('hex')
    const user = process.env.USER_ADMIN

    if (!user) return
    await db.query('DELETE FROM users;')
    await db.query(`
        INSERT INTO users (name, email, password, salt)
        VALUES ('${user}', 'victor8titov@gmail.com', '${hash}', '${salt}');
    `)
    console.log('added super user')
  } catch (e) {
    console.log(e)
  }
}

async function createTemplatesForImages () {
  try {
    await db.query('DELETE FROM templates_image;')
    await db.query(`
      INSERT INTO templates_image (name, width, height)
        VALUES 
          ('mid', 800, null),
          ('small', 300, 300);
    `)

    console.log('added templates_image table successful')
  } catch (e) {
    console.error(e)
  }
}

async function createHomePageDefault () {
  try {
    await db.query('DELETE FROM homepage;')
    await db.query(`
      INSERT INTO homepage (language, title, subtitle, description)
        VALUES 
          ('en', 'title default', 'subtitle default', 'description default'),
          ('ru', 'title default', 'subtitle default', 'description default');
    `)

    console.log('added templates_image table successful')
  } catch (e) {
    console.error(e)
  }
}

(async function () {
  await createSuperUser()
  await insertLanguages()
  await createTemplatesForImages()
  await createHomePageDefault()
  await db.end()

  console.log('finished')
})()
