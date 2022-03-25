import { query } from 'express'
import { Client } from 'pg'
import format from 'pg-format'
import { EventAndDate, Language, ObjectWithLanguage } from './types'

export type TimeStampCreation = {
  name: string
  link?: string
  events: EventAndDate[]
  description: ObjectWithLanguage
}

export type TimeStampView = Omit<Required<TimeStampCreation>, 'description'> & {
  id: string
  currentLanguage: Language
  description: string
}

export type ListTimeStamps = {
  languages: Language[]
  currentLanguage: Language
  items: Omit<TimeStampView, 'currentLanguage'>[]
}

export async function getNamesAndIdTimeStamps (): Promise<{ id: string, name: string }[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT name, time_stamp_id as id FROM time_stamps;
    `)

    return rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getListTimeStamps (language: Language): Promise<Omit<TimeStampView, 'currentLanguage'>[]> {
  const db = new Client()
  try {
    await db.connect()

    const result: Omit<TimeStampView, 'currentLanguage'>[] = []
    const { rows } = await db.query<{id: string, name: string, link: string}>('SELECT time_stamp_id as id, name, link FROM time_stamps;')

    for (const _timeStamp of rows) {
      const _timeStampId = _timeStamp.id

      const { rows: descriptionList } = await db.query(`
        SELECT content as description FROM multilingual_content 
        WHERE time_stamp_id = $1 AND language = $2;
      `, [_timeStampId, language])

      const { rows: eventsList } = await db.query<{date: string, status: string}>(`
        SELECT date, status FROM events
          WHERE time_stamp_id = $1;
      `, [_timeStampId])

      result.push({
        ..._timeStamp,
        description: descriptionList.shift()?.description || '',
        events: eventsList || []
      })
    }
    return result
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getTimeStampById (timeStampId: string, language: string): Promise<Omit<TimeStampView, 'currentLanguage'> | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<{id: string, name: string, link: string}>(`
      SELECT time_stamp_id as id, name, link FROM time_stamps
        WHERE time_stamp_id = $1;
      `, [timeStampId])

    const _timeStamp = rows.shift()
    if (!_timeStamp) return undefined

    const { rows: descriptionList } = await db.query(`
      SELECT content as description FROM multilingual_content 
        WHERE time_stamp_id = $1 AND language = $2;
      `, [timeStampId, language])

    const { rows: eventsList } = await db.query<{date: string, status: string}>(`
      SELECT date, status FROM events
        WHERE time_stamp_id = $1;
      `, [timeStampId])

    return {
      ..._timeStamp,
      description: descriptionList.shift()?.description || '',
      events: eventsList || []
    }
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function createTimeStamp (timeStamp: TimeStampCreation): Promise<number> {
  const db = new Client()
  try {
    const { name, link, events, description } = timeStamp

    await db.connect()

    await db.query('BEGIN;')

    const { rows: timeStampListId } = await db.query(`
      INSERT INTO time_stamps
        (name, link)
        VALUES
        ($1, $2)
        RETURNING time_stamp_id as id;
    `, [name, link])

    const timeStampId = timeStampListId.shift().id

    if (!timeStampId) {
      await db.query('ROLLBACK;')
      throw new Error('Error during creating time stamp entity')
    }

    /* creating description */
    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        [timeStampId, _language, description[_language as Language]])

      const _query = format(`
        INSERT INTO multilingual_content
          (time_stamp_id, language, content)
          VALUES 
          %L;
        `, _values)

      await db.query(_query)
    }

    /* creating events */
    if (events) {
      const _values = events.map(i => [i.date, i.status, timeStampId])

      const _query = format(`
        INSERT INTO events
          (date, status, time_stamp_id)
          VALUES
          %L;
      `, _values)
      await db.query(_query)
    }

    await db.query('COMMIT;')
    return timeStampId
  } catch (e: any) {
    await db.query('ROLLBACK;')
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function updateTimeStamp (timeStampId: string, timeStamp: TimeStampCreation): Promise<void> {
  const db = new Client()
  try {
    const { name, link, events, description } = timeStamp
    await db.connect()

    await db.query('BEGIN;')

    await db.query(`
      UPDATE time_stamps SET 
        name = $1,
        link = $2
        WHERE time_stamp_id = $3;
    `, [name, link, timeStampId])

    /* delete all description connected with time stamp entity */
    await db.query(`
      DELETE FROM multilingual_content
        WHERE time_stamp_id = $1;  
    `, [timeStampId])

    /* creating description */
    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        [timeStampId, _language, description[_language as Language]])

      const _query = format(`
        INSERT INTO multilingual_content
          (time_stamp_id, language, content)
          VALUES 
          %L;
        `, _values)

      await db.query(_query)
    }

    /* delete all events that connecting with time stamp entity */
    await db.query(`
      DELETE FROM events
        WHERE time_stamp_id = $1;
    `, [timeStampId])

    /* creating events */
    if (events) {
      const _values = events.map(i => [i.date, i.status, timeStampId])

      const _query = format(`
        INSERT INTO events
          (date, status, time_stamp_id)
          VALUES
          %L;
      `, _values)
      await db.query(_query)
    }
    await db.query('COMMIT;')
  } catch (e: any) {
    await db.query('ROLLBACK;')
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function deleteTimeStampById (timeStampId: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query(`
      DELETE FROM time_stamps
        WHERE time_stamp_id = $1
    `, [timeStampId])
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
