export interface PackageDetail {
  downloads: {
    monthly: number
    weekly: number
  }
  dependents: number
  searchScore: number
  package: PackageInfo
}

export interface PackageInfo {
  name: string
  sanitized_name: string
  scope: string
  version: string
  description: string
  date: string
  links: Links
  author?: Author
  publisher: Publisher
  maintainers: Maintainer[]
  keywords?: string[]
  license: string
}

export interface Links {
  npm: string
  homepage?: string
  repository?: string
  bugs?: string
}

export interface Author {
  name: string
  email?: string
  username?: string
  url?: string
}

export interface Publisher {
  username: string
  email: string
}

export interface Maintainer {
  username: string
  email: string
}

export interface Detail {
  quality: number
  popularity: number
  maintenance: number
}
