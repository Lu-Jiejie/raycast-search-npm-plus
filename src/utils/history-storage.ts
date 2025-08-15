import type { PackageDetail } from '../model/npmResponse.model'
import { getPreferenceValues, LocalStorage } from '@raycast/api'
import dedupe from 'dedupe'

const LOCAL_STORAGE_KEY = 'npm-history'

export type HistoryType = 'search' | 'package'
export interface HistoryItem {
  term: string
  type: HistoryType
  description?: string
  packageDetail?: PackageDetail
}
export async function getHistory(): Promise<HistoryItem[]> {
  const { historyCount } = getPreferenceValues<ExtensionPreferences>()
  const historyFromStorage
    = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY)
  const history: HistoryItem[] = JSON.parse(historyFromStorage ?? '[]')
  const historyWithoutDuplicates = dedupe(history)

  if (historyWithoutDuplicates.length > Number(historyCount)) {
    historyWithoutDuplicates.length = Number(historyCount)
  }

  return historyWithoutDuplicates
}

export async function addToHistory(item: HistoryItem) {
  const { historyCount } = getPreferenceValues<ExtensionPreferences>()
  const history = await getHistory()
  const historyWithNewItem = [item, ...history]
  const updatedHistoryList = [...new Set(historyWithNewItem)]

  if (updatedHistoryList.length > Number(historyCount)) {
    updatedHistoryList.length = Number(historyCount)
  }

  await LocalStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedHistoryList),
  )
  return await getHistory()
}

function removeMatchingItemFromArray(arr: HistoryItem[], item: HistoryItem): HistoryItem[] {
  let i = 0
  while (i < arr.length) {
    if (arr[i].term === item.term && arr[i].type === item.type) {
      arr.splice(i, 1)
    }
    else {
      ++i
    }
  }
  return arr
}
export async function removeItemFromHistory(item: HistoryItem) {
  const history = await getHistory()
  const updatedHistoryList = removeMatchingItemFromArray(history, item)
  await LocalStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedHistoryList),
  )
  return await getHistory()
}

export async function removeAllItemsFromHistory() {
  await LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
  return await getHistory()
}
