import { HomePageData, HomePageDataInterface } from '../../bin/database/homepage'
import { HomePage, OptionsRequest } from '../../bin/database/types'

export async function getHomePage (options?: OptionsRequest): Promise<Omit<HomePage, 'images' | 'imageId'>[] | undefined> {
  const _language = options && options.language ? options.language : undefined

  const _db: HomePageDataInterface = new HomePageData()
  return _db.getHomePage(_language)
}

export async function createHomePage (data: Omit<HomePage, 'images' | 'image'>): Promise<void> {
  const _db: HomePageDataInterface = new HomePageData()
  return _db.createHomePage(data)
}

export async function updateHomePage (data: Omit<HomePage, 'images' | 'image'>): Promise<void> {
  const _db: HomePageDataInterface = new HomePageData()
  return _db.updateHomePage(data)
}
