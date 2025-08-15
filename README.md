<div align="center">
  <img
    src="https://github.com/mrmartineau/raycast-extensions/blob/main/search-npm/assets/command-icon.png?raw=true"
    width="50"
  />

  <h1>
    Search NPM Plus
  </h1>

Raycast extension to search and favorite npm packages

</div>

> [!IMPORTANT]
> This extension is forked from the original [Search npm Packages](https://www.raycast.com/mrmartineau/search-npm)

## Differences from the original

- Refine search list display
- Separate package and search history

## Installation

This extension has not been published to the Raycast Store yet, so you need to install it manually by cloning the repository and running it in development mode.

You should have [Node.js](https://nodejs.org/en/download/) and [pnpm](https://pnpm.io/installation) installed before installing.

1. Clone this repository

```bash
git clone https://github.com/Lu-Jiejie/raycast-search-npm-plus
```

2. Go to the cloned directory and install dependencies

```bash
cd raycast-search-npm-plus
pnpm install
```

3. Install this extension in Raycast

```bash
pnpm run dev
```

<br/>
<br/>

> [!NOTE]
> The following is the original README for the Search npm Packages extension.

## Actions for each search result

### Links

- open the package's repository (if it is known)
- open the package's homepage (if it is known)
- open the package's changelog (if it is known)
- open the package's npm page
- open the package's Skypack.dev page

### Info

- view the package's README in a Raycast detail view
- view the package's bundle cost on [bundlephobia.com](https://bundlephobia.com). hit <kbd>cmd + shift + enter</kbd>
- view the package's [Snyk](https://snyk.io) vulnerability report
- view the package source code on [GitHub.dev](https://github.dev) & [CodeSandbox](https://codesandbox.io)

### Actions

- add/remove package to/from favorites

### Copy

- copy yarn/npm install commands to clipboard
  - copy install command for preferred package manager: <kbd>cmd + shift + c</kbd>
  - copy install command for alternate package manager: <kbd>cmd + opt + c</kbd>
- copy package name to clipboard

## Preferences

- choose your default package manager. `yarn`, `npm` or `pnpm`
- choose your secondary package manager. `yarn`, `npm` or `pnpm`
- choose the default "open" action for a package: "open repository", "open homepage" or "open npm package page" or "open Skypack package page"
- choose how many history items to show

## Screencast

https://github.com/raycast/extensions/assets/64883/e94be63a-50c9-4fa5-9f7c-788ebbb4ca72

## Options

<img width="311" alt="image" src="https://github.com/raycast/extensions/assets/64883/a4953656-6678-4f72-ac50-2e6b54a21172">
