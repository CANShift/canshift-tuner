import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = fileURLToPath(new URL('.', import.meta.url))
const RUNTIME_SOURCE = /\.(ts|tsx|css)$/
const TEST_SOURCE = /\.test\.tsx?$/
const REMOTE_ORIGIN = /https?:\/\/(?!www\.w3\.org\/)[a-z0-9.-]+/gi

const runtimeFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return runtimeFiles(path)
    return RUNTIME_SOURCE.test(name) && !TEST_SOURCE.test(name) ? [path] : []
  })

describe('the tuner runs offline', () => {
  it('names no remote origin in runtime code', () => {
    const offenders = runtimeFiles(SRC).flatMap((file) =>
      (readFileSync(file, 'utf8').match(REMOTE_ORIGIN) ?? []).map((url) => `${file}: ${url}`)
    )
    expect(offenders).toEqual([])
  })
})
