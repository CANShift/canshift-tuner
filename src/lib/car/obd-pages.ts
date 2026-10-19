import { STRINGS } from '../../strings'

const RANGE_MIN_LENGTH = 3

const consecutiveRuns = (pages: readonly number[]): number[][] =>
  [...new Set(pages)]
    .sort((a, b) => a - b)
    .reduce<number[][]>((runs, page) => {
      const last = runs.at(-1)
      if (last !== undefined && last.at(-1) === page - 1) last.push(page)
      else runs.push([page])
      return runs
    }, [])

const runText = (run: readonly number[]): string =>
  run.length >= RANGE_MIN_LENGTH ? `${String(run[0])}–${String(run.at(-1))}` : run.join(', ')

export const pageListText = (pages: readonly number[]): string =>
  consecutiveRuns(pages).map(runText).join(', ')

export const pagesText = (pages: readonly number[]): string => {
  if (pages.length === 0) return STRINGS.car.onNoPage
  const list = pageListText(pages)
  return new Set(pages).size === 1 ? STRINGS.car.onPage(list) : STRINGS.car.onPages(list)
}
