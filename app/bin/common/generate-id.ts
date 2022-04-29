import { customAlphabet } from 'nanoid'
import { alphanumeric } from 'nanoid-dictionary'

const nanoid = customAlphabet(alphanumeric)

export function generateId (size?: number) {
  return (size ? nanoid(size) : nanoid()).toLowerCase()
}
