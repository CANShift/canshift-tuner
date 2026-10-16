import { canonicalStringify } from '../canonical-json'

export type PathSegment = string | { id: string }

export type SetupPath = readonly PathSegment[]

type Container = Record<string, unknown> | unknown[]

const isContainer = (value: unknown): value is Container =>
  typeof value === 'object' && value !== null

const hasId = (item: unknown, id: string): boolean =>
  isContainer(item) && !Array.isArray(item) && item.id === id

const indexById = (list: unknown[], id: string): number => list.findIndex((item) => hasId(item, id))

const step = (node: unknown, segment: PathSegment): unknown => {
  if (!isContainer(node)) return undefined
  if (typeof segment === 'string') return Array.isArray(node) ? undefined : node[segment]
  return Array.isArray(node) ? node.find((item) => hasId(item, segment.id)) : undefined
}

export const readPath = (root: unknown, path: SetupPath): unknown =>
  path.reduce<unknown>(step, root)

export const indexAt = (root: unknown, path: SetupPath): number => {
  const last = path[path.length - 1]
  const parent = readPath(root, path.slice(0, -1))
  if (last === undefined || typeof last === 'string' || !Array.isArray(parent)) return -1
  return indexById(parent, last.id)
}

const assignKey = (parent: Record<string, unknown>, key: string, value: unknown): void => {
  if (value === undefined) {
    delete parent[key]
    return
  }
  parent[key] = value
}

const assignItem = (parent: unknown[], id: string, value: unknown, at: number): void => {
  const index = indexById(parent, id)
  if (value === undefined) {
    if (index >= 0) parent.splice(index, 1)
    return
  }
  if (index >= 0) {
    parent[index] = value
    return
  }
  parent.splice(Math.min(Math.max(at, 0), parent.length), 0, value)
}

export const writePath = (root: unknown, path: SetupPath, value: unknown, at = -1): void => {
  const last = path[path.length - 1]
  const parent = readPath(root, path.slice(0, -1))
  if (last === undefined || !isContainer(parent)) return
  if (typeof last === 'string') {
    if (!Array.isArray(parent)) assignKey(parent, last, value)
    return
  }
  if (Array.isArray(parent)) assignItem(parent, last.id, value, at < 0 ? parent.length : at)
}

export const sameValue = (a: unknown, b: unknown): boolean =>
  canonicalStringify(a ?? null) === canonicalStringify(b ?? null)

export const pathKey = (path: SetupPath): string =>
  path.map((segment) => (typeof segment === 'string' ? segment : `#${segment.id}`)).join('/')
