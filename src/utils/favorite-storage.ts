import type { PackageDetail } from '../model/npmResponse.model'
import { LocalStorage } from '@raycast/api'
import dedupe from 'dedupe'

const LOCAL_STORAGE_KEY = 'npm-faves'

export async function getFavorites(): Promise<PackageDetail[]> {
  const favesFromStorage = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY)
  const faves: PackageDetail[] = JSON.parse(favesFromStorage ?? '[]')
  const favesWithoutDuplicates = dedupe(faves)
  return favesWithoutDuplicates
}

export async function addFavorite(item: PackageDetail) {
  const faves = await getFavorites()
  const favesWithNewItem = [item, ...faves]
  const updatedFavesList = [...new Set(favesWithNewItem)]

  await LocalStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedFavesList),
  )
  return await getFavorites()
}

function removeMatchingItemFromArray(arr: PackageDetail[], item: PackageDetail): PackageDetail[] {
  let i = 0
  while (i < arr.length) {
    if (arr[i].package.name === item.package.name) {
      arr.splice(i, 1)
    }
    else {
      ++i
    }
  }
  return arr
}
export async function removeItemFromFavorites(item: PackageDetail) {
  const faves = await getFavorites()
  const updatedFavesList = removeMatchingItemFromArray(faves, item)
  await LocalStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedFavesList),
  )
  return await getFavorites()
}

export async function removeAllItemsFromFavorites() {
  await LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
  return await getFavorites()
}
