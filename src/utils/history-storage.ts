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
  const { packageHistoryCount, searchHistoryCount } = getPreferenceValues<ExtensionPreferences>()
  const historyFromStorage = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY)
  const history: HistoryItem[] = JSON.parse(historyFromStorage ?? '[]')
  const historyWithoutDuplicates = dedupe(history)

  // 分组处理
  const packageHistory = historyWithoutDuplicates.filter(h => h.type === 'package').slice(0, Number(packageHistoryCount))
  const searchHistory = historyWithoutDuplicates.filter(h => h.type === 'search').slice(0, Number(searchHistoryCount))

  // 返回合并后的分组历史，package在前
  return [...packageHistory, ...searchHistory]
}

export async function addToHistory(item: HistoryItem) {
  const { packageHistoryCount, searchHistoryCount } = getPreferenceValues<ExtensionPreferences>()
  const historyFromStorage = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY)
  const history: HistoryItem[] = JSON.parse(historyFromStorage ?? '[]')
  // 新增项放最前
  const historyWithNewItem = [item, ...history]
  const historyWithoutDuplicates = dedupe(historyWithNewItem)
  // 分组处理
  const packageHistory = historyWithoutDuplicates.filter(h => h.type === 'package').slice(0, Number(packageHistoryCount))
  const searchHistory = historyWithoutDuplicates.filter(h => h.type === 'search').slice(0, Number(searchHistoryCount))
  const updatedHistoryList = [...packageHistory, ...searchHistory]
  await LocalStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(updatedHistoryList),
  )
  return updatedHistoryList
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
