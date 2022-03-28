import { Client } from 'pg'
import { ImageView } from './image'

export type SocialMediaView = {
  name: string
  link: string
  icon?: ImageView
}

export type SocialMediaCreation = Omit<SocialMediaView, 'icon'> & {
  imageId: string
}

export type SocialMediaList = {
  items: SocialMediaView[]
}

export async function getListIdSocialMedia (): Promise<string[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<{ id: string }>(`
      SELECT link_id as id FROM links
        WHERE social_media = TRUE;
    `)

    return rows.map(i => i.id)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getAll (): Promise<(Omit<SocialMediaView, 'icon'> & { image: string})[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } =
      await db.query<{ id: string, name: string, link: string, image: string}>(`
      SELECT link_id as id, name, link, image_id as image 
        FROM links
        WHERE social_media = true
        ORDER BY name;
    `)

    return rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function create (socialMedia: SocialMediaCreation): Promise<number> {
  const db = new Client()
  try {
    const { name, link, imageId } = socialMedia

    await db.connect()
    await db.query('BEGIN;')

    const { rows } = await db.query(`
      INSERT INTO links 
      (name, link, social_media, image_id)
      VALUES
      ($1, $2, true, $3)
      RETURNING link_id as id;
    `, [name, link, imageId])

    const linkId = rows.shift().id

    if (!linkId) {
      await db.query('ROLLBACK;')
      throw new Error('Error during creating link entity')
    }

    await db.query('COMMIT;')
    return linkId
  } catch (e: any) {
    await db.query('ROLLBACK;')
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function update (socialMediaId: string, socialMedia: SocialMediaCreation): Promise<void> {
  const db = new Client()
  try {
    const { name, link, imageId } = socialMedia

    await db.connect()

    await db.query(`
      UPDATE links SET
        name = $1,
        link = $2,
        social_media = true,
        image_id = $3
        WHERE link_id = $4;
    `, [name, link, imageId, socialMediaId])
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function deleteById (socialMediaId: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query('DELETE FROM links WHERE link_id = $1', [socialMediaId])
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
