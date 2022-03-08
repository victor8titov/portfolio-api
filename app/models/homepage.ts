import { HomePageData, HomePageDataInterface } from '../../bin/database/homepage'
import { HomePage, OptionsRequest } from '../../bin/database/types'

export async function getHomePage (options?: OptionsRequest): Promise<HomePage[] | undefined> {
  const _language = options && options.language ? options.language : undefined

  const _db: HomePageDataInterface = new HomePageData()
  return _db.getHomePage(_language)
}

export async function createHomePage (data: HomePage): Promise<HomePage> {
  const _db: HomePageDataInterface = new HomePageData()
  return _db.createHomePage(data)
}

export async function updateHomePage (data: HomePage): Promise<HomePage> {
  const _db: HomePageDataInterface = new HomePageData()
  return _db.updateHomePage(data)
}
