export type BestEffortReport = (message: string, err: unknown) => void

const warnToConsole: BestEffortReport = (message, err) => {
  console.warn(message, err)
}

export const bestEffort = async (
  label: string,
  op: () => unknown,
  report: BestEffortReport = warnToConsole
): Promise<void> => {
  try {
    await op()
  } catch (err) {
    report(`${label} failed — continuing`, err)
  }
}
