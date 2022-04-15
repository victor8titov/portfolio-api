import Model from '.'
import { imageModel, ImageView } from './image'

export type SocialMediaView = {
  id: string
  name: string
  link: string
  icon?: ImageView
}

export type SocialMediaCreation = Omit<SocialMediaView, 'icon' | 'id'> & {
  imageId: string
}

export type SocialMediaList = {
  items: SocialMediaView[]
}

class SocialMediaModel extends Model {
  async getListId (): Promise<string[]> {
    return this.connect(async (client) => {
      const { rows } = await client.query<{ id: string }>(`
      SELECT link_id as id FROM links
        WHERE social_media = TRUE;
      `)

      return rows.map(i => i.id)
    })
  }

  async getAll (): Promise<SocialMediaList> {
    return this.connect(async (client) => {
      const items: SocialMediaView[] = []

      const { rows } =
      await client.query<{ id: string, name: string, link: string, image: string}>(`
      SELECT link_id as id, name, link, image_id as image 
        FROM links
        WHERE social_media = true
        ORDER BY name;
      `)

      for (const { image: imageId, ...rest } of rows) {
        let icon
        if (imageId) {
          icon = await imageModel.queryGetById(client, imageId)
        }
        items.push({
          ...rest,
          ...(icon ? { icon } : {})
        })
      }

      return { items }
    })
  }

  async create (socialMedia: SocialMediaCreation): Promise<number> {
    return this.connectWitTransaction(async (client) => {
      const { name, link } = socialMedia
      const imageId = socialMedia.imageId && socialMedia.imageId.length ? socialMedia.imageId : null

      const { rows } = await client.query(`
      INSERT INTO links 
        (name, link, social_media, image_id)
        VALUES
        ($1, $2, true, $3)
        RETURNING link_id as id;
      `, [name, link, imageId])

      const linkId = rows.shift().id

      if (!linkId) {
        throw new Error('Error during creating link entity')
      }

      return linkId
    })
  }

  async update (socialMediaId: string, socialMedia: SocialMediaCreation): Promise<void> {
    return this.connect(async (client) => {
      const { name, link } = socialMedia
      const imageId = socialMedia.imageId && socialMedia.imageId.length ? socialMedia.imageId : null

      await client.query(`
      UPDATE links SET
        name = $1,
        link = $2,
        social_media = true,
        image_id = $3
        WHERE link_id = $4;
      `, [name, link, imageId, socialMediaId])
    })
  }

  async deleteById (socialMediaId: string): Promise<void> {
    return this.connect(async (client) => {
      await client.query('DELETE FROM links WHERE link_id = $1', [socialMediaId])
    })
  }
}

export const socialMediaModel = new SocialMediaModel()
