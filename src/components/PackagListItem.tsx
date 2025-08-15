import type { PackageDetail } from '../model/npmResponse.model'
import type { HistoryItem } from '../utils/history-storage'
import {
  Action,
  ActionPanel,
  Color,
  getPreferenceValues,
  Icon,
  Keyboard,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import tinyRelativeDate from 'tiny-relative-date'
import Favorites from '../favorites'
import { Readme } from '../screens/Readme'
import {
  addFavorite,
  removeAllItemsFromFavorites,
  removeItemFromFavorites,
} from '../utils/favorite-storage'
import { getChangeLogUrl } from '../utils/getChangelogUrl'
import { addToHistory, removeItemFromHistory } from '../utils/history-storage'
import { parseRepoUrl } from '../utils/parseRepoUrl'
import { CopyInstallCommandActions } from './CopyInstallCommandActions'

interface PackageListItemProps {
  result: PackageDetail
  searchTerm?: string
  setHistory?: React.Dispatch<React.SetStateAction<HistoryItem[]>>
  isFavorited: boolean
  handleFaveChange?: () => Promise<void>
  isViewingFavorites?: boolean
  isHistoryItem?: boolean
}

export function PackageListItem({
  result,
  setHistory,
  isFavorited,
  handleFaveChange,
  isViewingFavorites,
  isHistoryItem,
}: PackageListItemProps): JSX.Element {
  const { defaultOpenAction, packageHistoryCount }
    = getPreferenceValues<ExtensionPreferences>()
  const { owner, name, type, repoUrl } = parseRepoUrl(result.package.links?.repository)
  const changelogUrl = getChangeLogUrl(type, owner, name)

  const handleAddToHistory = async () => {
    const history = await addToHistory({
      term: result.package.name,
      type: 'package',
      packageDetail: result,
    })
    if (Number(packageHistoryCount) <= 0)
      return
    setHistory?.(history)
    showToast(Toast.Style.Success, `Added ${result.package.name} to history`)
  }
  const handleAddToFaves = async () => {
    await addFavorite(result)
    showToast(Toast.Style.Success, `Added ${result.package.name} to faves`)
    handleFaveChange?.()
  }
  const handleRemoveFromFaves = async () => {
    await removeItemFromFavorites(result)
    showToast(Toast.Style.Success, `Removed ${result.package.name} from faves`)
    handleFaveChange?.()
  }
  const handleRemoveAllFaves = async () => {
    await removeAllItemsFromFavorites()
    showToast(Toast.Style.Success, `Removed ${result.package.name} from faves`)
    handleFaveChange?.()
  }

  const openActions = {
    openRepository: repoUrl
      ? (
          <Action.OpenInBrowser
            key="openRepository"
            url={repoUrl}
            title="Open Repository"
            onOpen={handleAddToHistory}
          />
        )
      : null,
    openHomepage:
      result.package.links?.homepage && result.package.links.homepage !== repoUrl
        ? (
            <Action.OpenInBrowser
              key="openHomepage"
              url={result.package.links.homepage}
              title="Open Homepage"
              icon={Icon.Link}
              onOpen={handleAddToHistory}
            />
          )
        : null,
    npmPackagePage: (
      <Action.OpenInBrowser
        key="npmPackagePage"
        url={result.package.links.npm}
        title="Open npm Package Page"
        icon={{
          source: 'command-icon.png',
        }}
        onOpen={handleAddToHistory}
        shortcut={Keyboard.Shortcut.Common.Open}
      />
    ),
    changelogPackagePage: changelogUrl
      ? (
          <Action.OpenInBrowser
            key="openChangelog"
            url={changelogUrl}
            title="Open Changelog"
          />
        )
      : null,
    skypackPackagePage: (
      <Action.OpenInBrowser
        url={`https://www.skypack.dev/view/${result.package.name}`}
        title="Skypack Package Page"
        key="skypackPackagePage"
        onOpen={handleAddToHistory}
      />
    ),
  }

  const accessories: List.Item.Accessory[] = [
    // pkg?.keywords?.length
    //   ? {
    //       icon: Icon.Tag,
    //       tooltip: result.keywords.join(', '),
    //     }
    //   : {},
  ]
  // if (!isViewingFavorites) {
  accessories.push(
    {
      tag: {
        value: `@${result.package.publisher.username}`,
        color: Color.PrimaryText,
      },
    },
    {
      tag: {
        value: `v${result.package.version}`,
        color: Color.Blue,
      },
    },
    {
      tag: {
        value: `${tinyRelativeDate(new Date(result.package.date))}`,
        color: Color.Green,
      },
    },
    {
      tag: {
        value: `↓ ${result.downloads.monthly}`,
        color: Color.Purple,
      },
    },
  )
  if (isFavorited) {
    accessories.push({
      icon: {
        source: Icon.Star,
        tintColor: Color.Yellow,
      },
    })
  }
  // }

  return (
    <List.Item
      id={result.package.name}
      key={result.package.name}
      title={result.package.name}
      icon={Icon.Box}
      accessories={accessories}
      keywords={result.package.keywords}
      actions={(
        <ActionPanel>
          <ActionPanel.Section title="Links">
            {Object.entries(openActions)
              .sort(([a]) => {
                if (a === defaultOpenAction) {
                  return -1
                }
                else {
                  return 0
                }
              })
              .map(([, action]) => {
                if (!action) {
                  return null
                }
                return action
              })
              .filter(Boolean)}
          </ActionPanel.Section>
          <ActionPanel.Section title="Actions">
            {isFavorited
              ? (
                  <Action
                    title="Remove from Favorites"
                    onAction={handleRemoveFromFaves}
                    icon={Icon.StarDisabled}
                    shortcut={{ modifiers: ['cmd', 'shift'], key: 's' }}
                    style={Action.Style.Destructive}
                  />
                )
              : (
                  <Action
                    title="Add to Favorites"
                    onAction={handleAddToFaves}
                    icon={Icon.Star}
                    shortcut={{ modifiers: ['cmd', 'shift'], key: 's' }}
                  />
                )}
            {isViewingFavorites
              ? (
                  <Action
                    title="Remove All Favorites"
                    onAction={handleRemoveAllFaves}
                    icon={Icon.Trash}
                    shortcut={{ modifiers: ['cmd', 'shift'], key: 'backspace' }}
                    style={Action.Style.Destructive}
                  />
                )
              : (
                  <Action.Push
                    title="View Favorites"
                    target={<Favorites />}
                    icon={Icon.ArrowRight}
                  />
                )}
            {isHistoryItem && (
              <Action
                title="Remove from History"
                onAction={async () => {
                  const history = await removeItemFromHistory({
                    term: result.package.name,
                    type: 'package',
                  })
                  setHistory?.(history)
                }}
                icon={Icon.XMarkCircle}
                style={Action.Style.Destructive}
              />
            )}
          </ActionPanel.Section>
          <ActionPanel.Section title="Info">
            {type === 'github' && owner && name
              ? (
                  <Action.Push
                    title="View Readme"
                    target={<Readme user={owner} repo={name} />}
                    icon={Icon.Paragraph}
                  />
                )
              : null}
            <Action.OpenInBrowser
              url={`https://bundlephobia.com/package/${result.package.name}`}
              title="Open Bundlephobia"
              icon={Icon.LevelMeter}
              shortcut={{ modifiers: ['cmd', 'shift'], key: 'enter' }}
            />
            <Action.OpenInBrowser
              url={`https://esm.sh/${result.package.name}`}
              title="Open Esm.sh URL"
              icon={Icon.Cloud}
              shortcut={{ modifiers: ['cmd', 'shift'], key: 'e' }}
            />
            {repoUrl && type === 'github'
              ? (
                  <Action.OpenInBrowser
                    url={repoUrl.replace('github.com', 'github.dev')}
                    title="View Code in Github.dev"
                    icon={{
                      source: {
                        light: 'github-bright.png',
                        dark: 'github-dark.png',
                      },
                    }}
                    shortcut={{ modifiers: ['cmd'], key: '.' }}
                  />
                )
              : null}
            {type === 'github' || (type === 'gitlab' && owner && name)
              ? (
                  <Action.OpenInBrowser
                    url={`https://codesandbox.io/s/${
                      type === 'github' ? 'github' : 'gitlab'
                    }/${owner}/${name}`}
                    title="View in Codesandbox"
                    icon={{
                      source: {
                        light: 'codesandbox-bright.png',
                        dark: 'codesandbox-dark.png',
                      },
                    }}
                  />
                )
              : null}
            <Action.OpenInBrowser
              url={`https://snyk.io/vuln/npm:${result.package.name}`}
              title="Open Snyk Vulnerability Check"
              icon={{
                source: {
                  light: 'snyk-bright.png',
                  dark: 'snyk-dark.png',
                },
              }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <CopyInstallCommandActions packageName={result.package.name} />
            <Action.CopyToClipboard
              title="Copy Package Name"
              content={result.package.name}
            />
            <Action.CopyToClipboard
              title="Copy Version"
              content={result.package.version}
            />
          </ActionPanel.Section>
        </ActionPanel>
      )}
    />
  )
}
