import type { PackageDetail } from './model/npmResponse.model'
import type { HistoryItem } from './utils/history-storage'
import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Icon,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import { useCachedState, useFetch } from '@raycast/utils'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { HistoryListItem } from './components/HistoryListItem'
import { PackageListItem } from './components/PackagListItem'
import { useFavorites } from './hooks/useFavorites'
import { addToHistory, getHistory } from './utils/history-storage'

// const API_PATH = 'https://www.npmjs.com/search/suggestions?q='
const API_PATH = 'https://registry.npmjs.org/-/v1/search'
export default function PackageList() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [history, setHistory] = useCachedState<HistoryItem[]>('history', [])
  const [favorites, fetchFavorites] = useFavorites()
  const { showLinkToSearchResultsInListView, searchResultSize } = getPreferenceValues<ExtensionPreferences>()

  const { isLoading, data, revalidate } = useFetch<PackageDetail[]>(
    `${API_PATH}?size=${searchResultSize}&text=${searchTerm.replace(/\s/g, '+')}`,
    {
      execute: !!searchTerm,
      onError: (error) => {
        if (searchTerm) {
          console.error(error)
          showToast(Toast.Style.Failure, 'Could not fetch packages')
        }
      },
      keepPreviousData: true,
      parseResponse: async response => (await response.json()).objects,
    },
  )

  const debounced = useDebouncedCallback(
    async (value) => {
      const history = await addToHistory({ term: value, type: 'search' })
      setHistory(history)
    },
    600,
    { debounceOnServer: true },
  )

  useEffect(() => {
    if (data) {
      // console.log(data[0])
    }
  }, [data])

  useEffect(() => {
    if (searchTerm) {
      debounced(searchTerm)
    }
    else {
      revalidate()
    }
  }, [searchTerm])

  useEffect(() => {
    async function fetchHistory() {
      const historyItems = await getHistory()
      setHistory(historyItems)
    }
    fetchHistory()
  }, [])

  return (
    <List
      searchText={searchTerm}
      isLoading={isLoading}
      searchBarPlaceholder={`Search packages, like "promises"…`}
      onSearchTextChange={setSearchTerm}
    >
      {searchTerm
        ? (
            <>
              {data?.length
                ? (
                    <>
                      {showLinkToSearchResultsInListView
                        ? (
                            <List.Item
                              title={`View search results for "${searchTerm}" on npmjs.com`}
                              icon={Icon.MagnifyingGlass}
                              actions={(
                                <ActionPanel>
                                  <Action.OpenInBrowser
                                    url={`https://www.npmjs.com/search?q=${searchTerm}`}
                                    title="View npm Search Results"
                                  />
                                </ActionPanel>
                              )}
                            />
                          )
                        : null}
                      <List.Section title="Results" subtitle={data.length.toString()}>
                        {data.map((result) => {
                          if (!result.package.name) {
                            return null
                          }
                          return (
                            <PackageListItem
                              key={`search-${result.package.name}`}
                              result={result}
                              searchTerm={searchTerm}
                              setHistory={setHistory}
                              isFavorited={
                                favorites.findIndex(
                                  item => item.package.name === result.package.name,
                                ) !== -1
                              }
                              handleFaveChange={fetchFavorites}
                            />
                          )
                        })}
                      </List.Section>
                    </>
                  )
                : null}
            </>
          )
        : (
            <>
              {history.length > 0
                ? (
                    <>
                      <List.Section title="Package History">
                        {history.filter(item => item.type === 'package').map((item) => {
                          if (item?.packageDetail?.package.name) {
                            const pkgName = item.packageDetail.package.name
                            return (
                              <PackageListItem
                                key={`history-${pkgName}`}
                                result={item.packageDetail}
                                searchTerm={searchTerm}
                                setHistory={setHistory}
                                isFavorited={
                                  favorites.findIndex(
                                    fave => fave.package.name === pkgName,
                                  ) !== -1
                                }
                                handleFaveChange={fetchFavorites}
                                isHistoryItem={true}
                              />
                            )
                          }
                          return null
                        })}
                      </List.Section>
                      <List.Section title="Search History">
                        {history.filter(item => item.type === 'search').map(item => (
                          <HistoryListItem
                            key={`history-${item.term}-${item.type}`}
                            item={item}
                            setHistory={setHistory}
                            setSearchTerm={setSearchTerm}
                          />
                        ))}
                      </List.Section>
                    </>
                  )
                : (
                    <List.EmptyView title="Type something to get started" />
                  )}
            </>
          )}
    </List>
  )
}
