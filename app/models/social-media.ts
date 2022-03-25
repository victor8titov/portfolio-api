import { query } from 'express'
import { Client } from 'pg'
import { getUrlImage } from '../../bin/common/paths'
import { ImageSimple } from './image'

export type SocialMediaView = {
  name: string
  link: string
  icon?: ImageSimple
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

export async function getAll (): Promise<SocialMediaList> {
  const db = new Client()
  try {
    await db.connect()

    const items: SocialMediaView[] = []

    const { rows } = await db.query<{ id: string, name: string, link: string}>(`
      SELECT link_id as id, name, link FROM links
        WHERE social_media = true
        ORDER BY name;
    `)

    for (const _link of rows) {
      const { rows } = await db.query(`
        SELECT image_id as id, name, description FROM images
          WHERE link_id = $1;
      `, [_link.id])
      const _image = rows.shift()

      items.push({
        ..._link,
        // icon: {
        //   ..._image,
        //   url: getUrlImage(_image.name)
        // }
      })
    }

    return { items }
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
      (name, link, social_media)
      VALUES
      ($1, $2, true)
      RETURNING link_id as id;
    `, [name, link])

    const linkId = rows.shift().id

    if (!linkId) {
      await db.query('ROLLBACK;')
      throw new Error('Error during creating link entity')
    }

    // if (imageId) {
    //   await db.query(`
    //     UPDATE images SET
    //     link_id = $1
    //     WHERE image_id = $2;
    //   `, [linkId, imageId])
    // }

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
    await db.query('BEGIN;')

    await db.query(`
      UPDATE links SET
        name = $1,
        link = $2,
        social_media = true
      WHERE link_id = $3;
    `, [name, link, socialMediaId])

    // if (imageId) {
    //   await db.query(`
    //     UPDATE images SET
    //     link_id = $1
    //     WHERE image_id = $2;
    //   `, [linkId, imageId])
    // }

    await db.query('COMMIT;')
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
