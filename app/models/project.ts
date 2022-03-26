import { Client } from 'pg'
import format from 'pg-format'
import { getUrlImage } from '../../bin/common/paths'
import { ImageView } from './image'
import { Language, ObjectWithLanguage, OptionsRequest } from './types'

export type Link = {
  readonly name: string
  readonly link: string
}

export enum ProjectStatuses {
  RELEASE = 'release'
}

export type Project = {
  readonly name: string
  readonly description: ObjectWithLanguage
  readonly type: string
  readonly spendTime: string
  readonly events: { date: string, status: ProjectStatuses }[]
  readonly stack: string[]
  readonly links: Link[]
  readonly imagesId?: string[]
  readonly currentLanguage?: Language
  readonly languages?: Language[]
  readonly id?: string
  readonly images?: ImageView[]
}

export type ProjectRequest = Omit<Project, 'languages' | 'id' | 'images' | 'currentLanguages' >

export type ProjectResponse = Omit<Project, 'imagesId'>

export type ProjectListWithPagination = {
  pagination?: {
    page: number
    pageSize: number
    totalPages: number
  }
  sorted?: string[]
  currentLanguage?: string
  supportedLanguages?: string[]
  items?: ProjectResponse[]
}

export async function getNameProjects (): Promise<{ name: string, id: string }[]> {
  const db = new Client()
  try {
    await db.connect()
    const _answer = await db.query('SELECT name, project_id as id FROM projects;')

    return _answer.rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getCountProjects (): Promise<number> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query('SELECT COUNT( * ) FROM projects;')
    return parseInt(rows.shift().count)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    db.end()
  }
}

export async function getProjectById (projectId: string, language: Language): Promise<Omit<ProjectResponse, 'currentLanguage' | 'language'> | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT name, type, stack, spend_time, release_date as release FROM projects 
        WHERE project_id = '${projectId}';
    `)

    const _project = rows.shift()
    if (!_project) return undefined

    const _contentDependFromLanguage = await db.query(`
      SELECT description from projects_multilanguge_content
        WHERE project_id = '${projectId}' AND language = '${language}';  
    `)

    /* form content that depend from language */
    const description = _contentDependFromLanguage.rows.shift()?.description || ''

    /* form links */
    const _linksRows = await db.query(`
      SELECT name, link FROM links
        WHERE project_id = '${projectId}';
    `)
    const links = _linksRows.rows || []

    const images = await getImageByProjectId(db, projectId)

    const { name, type, stack, spend_time: spendTime, release } = _project
    return {
      name,
      description,
      type,
      spendTime,
      events: release ? [{ date: release, status: ProjectStatuses.RELEASE }] : [],
      stack,
      links,
      images
    }
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getProjects (option: OptionsRequest): Promise<ProjectResponse[]> {
  const db = new Client()
  try {
    const { page, pageSize, language, sort } = option

    const order: string = sort?.map(item => {
      const direction = item.slice(0, 1) === '+' ? 'ASC' : 'DESC'
      return `${item.slice(1)} ${direction}`
    }).join(', ') || ''

    await db.connect()

    const { rows: _projects } = await db.query(`
      SELECT project_id as id, name, type, stack, spend_time, release_date as release 
        FROM projects 
        ${order ? 'ORDER BY ' + order : 'ORDER BY project_id'}
        ${pageSize && page ? 'LIMIT ' + pageSize : ''}
        ${pageSize && page ? 'OFFSET ' + ((page - 1) * pageSize) : ''}
    `)

    const _result = []
    for (const _project of _projects) {
      const { id, name, type, stack, spend_time: spendTime, release } = _project

      const _contentDependFromLanguage = await db.query(`
      SELECT description from projects_multilanguge_content
        WHERE project_id = '${id}' AND language = '${language}';  
      `)
      /* form content that depend from language */
      const description = _contentDependFromLanguage.rows.shift()?.description || ''

      /* form links */
      const _linksRows = await db.query(`
      SELECT name, link FROM links
        WHERE project_id = '${id}';
      `)
      const links = _linksRows.rows || []

      const events = release ? [{ date: release, status: ProjectStatuses.RELEASE }] : []

      const images = await getImageByProjectId(db, id)

      _result.push({ id, name, description, type, spendTime, events, stack, links, images })
    }

    return _result
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function createProject (project: ProjectRequest): Promise<string> {
  const db = new Client()
  try {
    const {
      name,
      description,
      type = '',
      spendTime = '',
      events = [],
      stack,
      links,
      imagesId
    } = project
    const releaseDate = events.find(i => i.status === ProjectStatuses.RELEASE)?.date || null

    await db.connect()

    await db.query('BEGIN;')

    const { rows } = await db.query(`
      INSERT INTO projects (name, type, stack, spend_time, release_date)
        VALUES 
          ('${name}', '${type}', '{${stack?.join(', ') || ''}}', '${spendTime}', ${releaseDate ? "'" + releaseDate + "'" : null})
          RETURNING project_id as id;
    `)
    const _projectId: string = rows.shift().id

    if (!_projectId) {
      await db.query('ROLLBACK;')
      throw new Error('There is Error during processing create project in database')
    }

    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) => `('${_projectId}', '${_language}', '${description[_language as Language] || null}')`)

      await db.query(`
        INSERT INTO projects_multilanguge_content (project_id, language, description)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    if (links && Array.isArray(links) && links.length) {
      const _values = links.map(item => `('${item.name}', '${item.link}', '${_projectId}')`)
      await db.query(`
        INSERT INTO links (name, link, project_id)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    if (imagesId && Array.isArray(imagesId) && imagesId.length) {
      const _values = imagesId.map(i => [_projectId, i])
      const _query = format(`
        INSERT INTO project_images 
          (project_id, image_id) 
          VALUES
          %L;
        `, _values)
      await db.query(_query)
    }

    await db.query('COMMIT;')

    return _projectId
  } catch (e: any) {
    await db.query('ROLLBACK;')
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function updateProject (project: ProjectRequest, projectId: string): Promise<void> {
  const db = new Client()
  try {
    const {
      name,
      description,
      type = '',
      spendTime = '',
      events = [],
      stack,
      links,
      imagesId
    } = project
    const releaseDate = events.find(i => i.status === ProjectStatuses.RELEASE)?.date

    await db.connect()

    await db.query('BEGIN;')

    await db.query(`
      UPDATE projects SET
        name = '${name}',
        type = '${type}',
        stack = '{${stack?.join(', ') || ''}}',
        spend_time = '${spendTime}',
        release_date = ${releaseDate ? "'" + releaseDate + "'" : null}
        WHERE project_id = ${projectId};
    `)

    /* table projects_multilanguge_content */
    await db.query(`
      DELETE FROM projects_multilanguge_content 
        WHERE project_id = '${projectId}';
    `)
    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) => `('${projectId}', '${_language}', '${description[_language as Language] || null}')`)

      await db.query(`
        INSERT INTO projects_multilanguge_content (project_id, language, description)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    // TODO пересмотреть запросы т.е написать одним запросом
    /* table links */
    await db.query(`
      DELETE FROM links 
        WHERE project_id = '${projectId}';
    `)
    if (links && Array.isArray(links) && links.length) {
      const _values = links.map(item => `('${item.name}', '${item.link}', '${projectId}')`)
      await db.query(`
        INSERT INTO links (name, link, project_id)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    // TODO попробовать написать одним запросом
    await db.query(`
      DELETE FROM project_images
        WHERE project_id = $1;
    `, [projectId])

    if (imagesId && Array.isArray(imagesId) && imagesId.length) {
      const _values = imagesId.map(i => [projectId, i])
      const _query = format(`
        INSERT INTO project_images 
          (project_id, image_id) 
          VALUES
          %L;
        `, _values)
      await db.query(_query)
    }

    await db.query('COMMIT;')
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function deleteProject (projectId: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query(`
      DELETE FROM projects
        WHERE project_id = '${projectId}';
    `)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

async function getImageByProjectId (db: Client, projectId: string): Promise<ImageView[]> {
  const images: ImageView[] = []

  const { rows } = await db.query<{ id: string }>(`
        SELECT image_id as id FROM project_images
          WHERE project_id = $1;
        `, [projectId])

  for (const { id: imageId } of rows) {
    const { rows: imagesList } = await db.query<{ id: string, description: string }>(`
        SELECT image_id as id, description FROM images
          WHERE image_id = $1;
        `, [imageId])
    const image = imagesList.shift()

    if (!image) {
      throw new Error('Error during getting image entity')
    }

    const { rows: divisionByTemplates } =
        await db.query<{ name: string, template: string, width: string | null, height: string | null}>(`
          SELECT name, template_name as template, width, height 
            FROM images_division_by_template
            WHERE image_id = $1
            ORDER BY name;
          `, [image.id])

    images.push({
      id: imageId,
      description: image.description,
      divisionByTemplates: divisionByTemplates.map(i => ({ ...i, url: getUrlImage(i.name) }))
    })
  }

  return images
}
