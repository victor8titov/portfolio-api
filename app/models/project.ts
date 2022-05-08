import { Client } from 'pg'
import format from 'pg-format'
import Model from '.'
import { defaultValue } from '../bin/config/default-settings'
import { imageModel, ImageView } from './image'
import { languageModel } from './language'
import { EventAndDate, Language, LinkCreation, LinkView, ObjectWithLanguage, Options } from './types'
import { transformToMultilingualObject } from '../bin/common/transform-to-multilingual-object'
import moment from 'moment'

export type ProjectCreation = {
  readonly name: string
  readonly description: ObjectWithLanguage
  readonly type: string
  readonly spendTime: string
  readonly stack: string[]
  readonly events: EventAndDate[]
  readonly links: LinkCreation[]
  readonly imagesId?: string[]
}

export type ProjectView = Omit<ProjectCreation, 'imagesId' | 'description' | 'links'> & {
  readonly id: string
  readonly description: string
  readonly images: ImageView[]
  readonly languages?: Language[]
  readonly currentLanguage?: Language
  readonly links: LinkView[]
}

export type ProjectViewMultilingual = Required<Omit<ProjectCreation, 'imagesId' | 'links'>> & {
  readonly id: string
  readonly images: ImageView[]
  readonly links: LinkView[]
}

export type ProjectList = {
  currentLanguage: string
  languages: string[]
  pagination?: {
    page: number
    pageSize: number
    totalPages: number
  }
  sorted?: string[]
  items: ProjectView[]
}

class ProjectModel extends Model {
  async getNames (): Promise<{ name: string, id: string }[]> {
    return this.connect(async (client) => {
      const { rows } = await client.query('SELECT name, project_id as id FROM projects;')

      return rows
    })
  }

  async getCount (): Promise<number> {
    return this.connect(async (client) => {
      return await this.queryGetCount(client)
    })
  }

  async getById (projectId: string, currentLanguage: Language): Promise<ProjectView | undefined> {
    return this.connect(async (client) => {
      const { rows } = await client.query(`
      SELECT name, type, stack, spend_time FROM projects 
        WHERE project_id = $1;
      `, [projectId])

      const project = rows.shift()
      if (!project) return undefined

      const { name, type, stack, spend_time: spendTime } = project

      const description = await this.queryGetDescription(client, projectId, currentLanguage)

      const links = await this.queryGetLinks(client, projectId)

      const events = await this.queryGetEvents(client, projectId)

      const languages = await languageModel.queryGetAll(client)

      const images = await this.queryGetImagesByProjectId(client, projectId)

      return {
        id: projectId,
        languages,
        currentLanguage,
        name,
        description,
        type,
        spendTime,
        events,
        stack,
        links,
        images
      }
    })
  }

  async getByIdMultilingual (projectId: string): Promise<ProjectViewMultilingual | undefined> {
    return this.connect(async (client) => {
      const { rows } = await client.query(`
      SELECT name, type, stack, spend_time FROM projects 
        WHERE project_id = $1;
      `, [projectId])

      const project = rows.shift()
      if (!project) return undefined

      const { name, type, stack, spend_time: spendTime } = project

      const languages = await languageModel.queryGetAll(client)
      const _description = await this.queryGetDescriptions(client, projectId)
      const description = transformToMultilingualObject(_description, languages, 'description')

      const links = await this.queryGetLinks(client, projectId)

      const events = await this.queryGetEvents(client, projectId)

      const images = await this.queryGetImagesByProjectId(client, projectId)

      return {
        id: projectId,
        name,
        description,
        type,
        spendTime,
        events,
        stack,
        links,
        images
      }
    })
  }

  async getList (option: Options): Promise<ProjectList> {
    return this.connect(async (client) => {
      const { page = defaultValue.page, pageSize = defaultValue.pageSize, language = Language.EN, sort } = option

      // TODO the sort don't work properly
      // need to finish sort with field and event date
      const order: string = sort?.map(item => {
        const direction = item.slice(0, 1) === '-' ? 'DESC' : 'ASC'
        return `${item.slice(1)} ${direction}`
      }).join(', ') || 'name'

      const offset = ((page - 1) * pageSize)

      const _query = format(`
        SELECT project_id as id, name, type, stack, spend_time
        FROM projects 
        ORDER BY %s
        LIMIT %L
        OFFSET %L;
      `, order, pageSize, offset)
      const { rows } = await client.query(_query)

      const items: ProjectView[] = []
      for (const { name, type, stack, spend_time: spendTime, id: projectId } of rows) {
        const description = await this.queryGetDescription(client, projectId, language)

        const links = await this.queryGetLinks(client, projectId)

        const events = await this.queryGetEvents(client, projectId)

        const images = await this.queryGetImagesByProjectId(client, projectId)

        items.push({
          id: projectId,
          name,
          description,
          type,
          spendTime,
          events,
          stack,
          links,
          images
        })
      }

      // sort list descending i.e. the most recent event will be the first
      items.sort((a, b) => {
        const aTime = a.events[0]?.date
        const bTime = b.events[0]?.date
        return moment(bTime).isBefore(aTime) ? -1 : 1
      })

      const languages = await languageModel.queryGetAll(client)

      const count = await this.queryGetCount(client)

      return {
        currentLanguage: language,
        languages,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize)
        },
        sorted: sort,
        items
      }
    })
  }

  async create (project: ProjectCreation): Promise<string> {
    return this.connectWitTransaction(async (client) => {
      const {
        name,
        type = '',
        spendTime = '',
        stack = [],
        description,
        events,
        links,
        imagesId
      } = project

      /* save to projects table */
      const { rows } = await client.query(`
        INSERT INTO projects (name, type, stack, spend_time)
          VALUES 
            ($1, $2, $3, $4)
            RETURNING project_id as id;
      `, [name, type, stack, spendTime])
      const projectId: string = rows.shift().id

      if (!projectId) {
        throw new Error('There is Error during processing create project in database')
      }

      /* update data in multilingual_content table */
      await this.queryUpdateDescription(client, projectId, description)

      /* update events table */
      await this.queryUpdateEvents(client, projectId, events)

      /* update table links */
      await this.queryUpdateLinks(client, projectId, links)

      /* update table project_images */
      await this.queryUpdateProjectImages(client, projectId, imagesId)

      return projectId
    })
  }

  async update (project: ProjectCreation, projectId: string): Promise<void> {
    return this.connectWitTransaction(async (client) => {
      const {
        name,
        description,
        type = '',
        spendTime = '',
        events,
        stack = [],
        links,
        imagesId
      } = project

      await client.query(`
        UPDATE projects SET
          name = $1,
          type = $2,
          stack = $3,
          spend_time = $4
          WHERE project_id = $5;
      `, [name, type, stack, spendTime, projectId])

      /* update data in multilingual_content table */
      await this.queryUpdateDescription(client, projectId, description)

      /* update events table */
      await this.queryUpdateEvents(client, projectId, events)

      /* update table links */
      await this.queryUpdateLinks(client, projectId, links)

      /* update table project_images */
      await this.queryUpdateProjectImages(client, projectId, imagesId)
    })
  }

  async deleteById (projectId: string): Promise<void> {
    return this.connect(async (client) => {
      await client.query(`
        DELETE FROM projects WHERE project_id = $1;
      `, [projectId])
    })
  }

  async queryGetCount (client: Client): Promise<number> {
    const { rows } = await client.query('SELECT COUNT( * ) FROM projects;')

    return parseInt(rows.shift().count)
  }

  async queryUpdateDescription (client: Client, projectId: string, description: ObjectWithLanguage | null | undefined): Promise<void> {
    await client.query(`
        DELETE FROM multilingual_content 
          WHERE project_id = $1;
      `, [projectId])

    if (description && Object.keys(description).length) {
      const languages = Object.keys(description)

      const _values =
        languages.map((_language) => [
          _language,
          description[_language as Language] || '',
          projectId
        ])

      const _query = format(`
        INSERT INTO multilingual_content 
          (language, content, project_id)
          VALUES %L;
        `, _values)
      await client.query(_query)
    }
  }

  async queryGetDescription (client: Client, projectId: string, language: Language): Promise<string> {
    const { rows } = await client.query(`
    SELECT content as description from multilingual_content
      WHERE project_id = $1 AND language = $2;  
    `, [projectId, language])

    return rows.shift()?.description || ''
  }

  async queryGetDescriptions (client: Client, projectId: string): Promise<{ description: string, language: Language }[]> {
    const { rows } = await client.query(`
    SELECT content as description, language from multilingual_content
      WHERE project_id = $1;  
    `, [projectId])

    return rows || []
  }

  async queryUpdateEvents (client: Client, projectId: string, events: EventAndDate[] | null | undefined): Promise<void> {
    await client.query(`
      DELETE FROM events
        WHERE project_id = $1;  
    `, [projectId])

    if (events && Array.isArray(events) && events.length) {
      const _values = events.map(item => [item.date, item.status, projectId])
      const _query = format(`
        INSERT INTO events 
        (date, status, project_id)
        VALUES %L;
      `, _values)
      await client.query(_query)
    }
  }

  async queryGetEvents (client: Client, projectId: string): Promise<EventAndDate[]> {
    const { rows } = await client.query<EventAndDate>(`
      SELECT date, status FROM events 
        WHERE project_id = $1;  
    `, [projectId])

    return rows
  }

  async queryUpdateLinks (client: Client, projectId: string, links: LinkCreation[] | null | undefined): Promise<void> {
    await client.query(`
        DELETE FROM links 
          WHERE project_id = $1;
      `, [projectId])

    if (links && Array.isArray(links) && links.length) {
      const _values = links.map(item => [item.name, item.link, item.imageId, projectId])
      const _query = format(`
        INSERT INTO links (name, link, image_id, project_id)
          VALUES %L;
      `, _values)
      await client.query(_query)
    }
  }

  async queryGetLinks (client: Client, projectId: string): Promise<LinkView[]> {
    const listLink: LinkView[] = []

    const { rows } = await client.query<{ name: string, link: string, image: string}>(`
      SELECT name, link, image_id as image FROM links
        WHERE project_id = $1;
    `, [projectId])

    for (const { name, link, image: imageId } of rows) {
      if (imageId) {
        const icon = await imageModel.queryGetById(client, imageId)
        listLink.push({ name, link, icon })
      } else {
        listLink.push({ name, link })
      }
    }

    return listLink || []
  }

  async queryUpdateProjectImages (client: Client, projectId: string, imagesId: string[] | null | undefined): Promise<void> {
    await client.query(`
        DELETE FROM project_images
          WHERE project_id = $1;
      `, [projectId])

    if (imagesId && Array.isArray(imagesId) && imagesId.length) {
      const _values = imagesId.map(_imageId => [projectId, _imageId])
      const _query = format(`
        INSERT INTO project_images 
          (project_id, image_id) 
          VALUES
          %L;
        `, _values)
      await client.query(_query)
    }
  }

  async queryGetImagesByProjectId (client: Client, projectId: string): Promise<ImageView[]> {
    const images: ImageView[] = []

    const { rows } = await client.query<{ id: string }>(`
        SELECT image_id as id FROM project_images
          WHERE project_id = $1;
        `, [projectId])

    for (const { id: imageId } of rows) {
      const _image = await imageModel.queryGetById(client, imageId)

      images.push(_image)
    }

    return images || []
  }
}

export const projectModel = new ProjectModel()
