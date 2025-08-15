import { useCachedState } from '@raycast/utils'
import { useEffect } from 'react'
import type { PackageDetail } from '../model/npmResponse.model'
import { getFavorites } from '../utils/favorite-storage'

export const useFavorites = (): [PackageDetail[], () => Promise<void>] => {
  const [favorites, setFavorites] = useCachedState<PackageDetail[]>('favorites', [])

  const fetchFavorites = async () => {
    const favoriteItems = await getFavorites()
    setFavorites(favoriteItems)
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return [favorites, fetchFavorites]
}
