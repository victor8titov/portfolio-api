import { Client } from 'pg'
import format from 'pg-format'
import Model from '.'
import { languageModel } from './language'
import { EventAndDate, Language, ObjectWithLanguage } from './types'

export type TimeStampCreation = {
  name: string
  link?: string
  events: EventAndDate[]
  description: ObjectWithLanguage
}

export type TimeStampView = Omit<Required<TimeStampCreation>, 'description'> & {
  id: string
  description: string
  currentLanguage?: Language
}

export type ListTimeStamps = {
  languages: Language[]
  currentLanguage: Language
  items: TimeStampView[]
}

class TimeStampModel extends Model {
  async getNamesAndId (): Promise<{ id: string, name: string }[]> {
    return this.connect(async (client) => {
      const { rows } = await client.query(`
        SELECT name, time_stamp_id as id FROM time_stamps;
    `)

      return rows
    })
  }

  async getAll (language: Language): Promise<ListTimeStamps> {
    return this.connect(async (client) => {
      const { rows } =
        await client.query<{id: string, name: string, link: string}>(`
          SELECT time_stamp_id as id, name, link FROM time_stamps;
        `)

      const items: TimeStampView[] = []
      for (const { id: timeStampId, name, link } of rows) {
        const description = await this.queryGetDescription(client, timeStampId, language)

        const events = await this.queryEvents(client, timeStampId)

        items.push({
          id: timeStampId,
          name,
          link,
          description,
          events
        })
      }

      const languages = await languageModel.queryGetAll(client)

      return {
        currentLanguage: language,
        languages,
        items
      }
    })
  }

  async getById (timeStampId: string, language: Language): Promise<TimeStampView | undefined> {
    return this.connect(async (client) => {
      const { rows } = await client.query<{id: string, name: string, link: string}>(`
      SELECT time_stamp_id as id, name, link FROM time_stamps
        WHERE time_stamp_id = $1;
      `, [timeStampId])

      const _timeStamp = rows.shift()
      if (!_timeStamp) return undefined

      const description = await this.queryGetDescription(client, _timeStamp.id, language)

      const events = await this.queryEvents(client, _timeStamp.id)

      return {
        ..._timeStamp,
        description,
        events,
        currentLanguage: language
      }
    })
  }

  async create (timeStamp: TimeStampCreation): Promise<number> {
    return this.connectWitTransaction(async (client) => {
      const { name, link, events, description } = timeStamp

      const { rows: timeStampListId } = await client.query(`
        INSERT INTO time_stamps
          (name, link)
          VALUES
          ($1, $2)
          RETURNING time_stamp_id as id;
      `, [name, link])

      const timeStampId = timeStampListId.shift().id

      if (!timeStampId) {
        throw new Error('Error during creating time stamp entity')
      }

      await this.queryUpdateDescription(client, timeStampId, description)

      await this.queryUpdateEvents(client, timeStampId, events)

      return timeStampId
    })
  }

  async update (timeStampId: string, timeStamp: TimeStampCreation): Promise<void> {
    return this.connectWitTransaction(async (client) => {
      const { name, link, events, description } = timeStamp

      await client.query(`
        UPDATE time_stamps SET 
          name = $1,
          link = $2
          WHERE time_stamp_id = $3;
      `, [name, link, timeStampId])

      await this.queryUpdateDescription(client, timeStampId, description)

      await this.queryUpdateEvents(client, timeStampId, events)
    })
  }

  async delete (timeStampId: string): Promise<void> {
    return this.connect(async (client) => {
      await client.query(`
      DELETE FROM time_stamps
        WHERE time_stamp_id = $1
    `, [timeStampId])
    })
  }

  async queryUpdateDescription (client: Client, timeStampId: string, description: ObjectWithLanguage | undefined | null): Promise<void> {
    await client.query(`
      DELETE FROM multilingual_content
        WHERE time_stamp_id = $1;  
    `, [timeStampId])

    if (description && Object.keys(description).length) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        [timeStampId, _language, description[_language as Language]])

      const _query = format(`
        INSERT INTO multilingual_content
          (time_stamp_id, language, content)
          VALUES 
          %L;
        `, _values)
      await client.query(_query)
    }
  }

  async queryUpdateEvents (client: Client, timeStampId: string, events: EventAndDate[] | undefined | null): Promise<void> {
    /* delete all events that connecting with time stamp entity */
    await client.query(`
     DELETE FROM events
       WHERE time_stamp_id = $1;
   `, [timeStampId])

    /* creating events */
    if (events && events.length) {
      const _values = events.map(i => [i.date, i.status, timeStampId])

      const _query = format(`
       INSERT INTO events
         (date, status, time_stamp_id)
         VALUES
         %L;
     `, _values)
      await client.query(_query)
    }
  }

  async queryGetDescription (client: Client, timeStampId: string, language: Language): Promise<string> {
    const { rows } = await client.query(`
        SELECT content as description FROM multilingual_content 
        WHERE time_stamp_id = $1 AND language = $2;
      `, [timeStampId, language])
    return rows.shift()?.description || ''
  }

  async queryEvents (client: Client, timeStampId: string): Promise<EventAndDate[]> {
    const { rows } = await client.query<{date: string, status: string}>(`
    SELECT date, status FROM events
      WHERE time_stamp_id = $1;
  `, [timeStampId])

    return rows || []
  }
}

export const timeStampModel = new TimeStampModel()
