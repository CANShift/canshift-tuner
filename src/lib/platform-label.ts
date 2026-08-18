const UA_MAX_CHARS = 120
const IGNORED_BRANDS = /not.*a.*brand|chromium/i

interface UserAgentBrand {
  brand: string
  version: string
}

interface UserAgentData {
  platform?: string
  brands?: UserAgentBrand[]
}

const userAgentData = (): UserAgentData | null => {
  const candidate: unknown = (navigator as { userAgentData?: unknown }).userAgentData
  if (typeof candidate !== 'object' || candidate === null) return null
  return candidate as UserAgentData
}

const brandLabel = (brands: UserAgentBrand[] | undefined): string | null => {
  const named = brands?.find((brand) => !IGNORED_BRANDS.test(brand.brand))
  return named ? `${named.brand} ${named.version}` : null
}

export const platformLabel = (): string => {
  const data = userAgentData()
  const browser = brandLabel(data?.brands)
  if (data?.platform !== undefined && browser !== null) return `${data.platform} · ${browser}`
  if (browser !== null) return browser
  return navigator.userAgent.slice(0, UA_MAX_CHARS)
}
