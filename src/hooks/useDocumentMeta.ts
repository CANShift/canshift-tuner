import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTE_META, type RoutePath } from '../constants/routes'

const isKnownPath = (pathname: string): pathname is RoutePath => pathname in ROUTE_META

export const useDocumentMeta = (): void => {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = isKnownPath(pathname) ? ROUTE_META[pathname] : ROUTE_META['/']
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [pathname])
}
