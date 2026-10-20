export const CAR_SCAN = {
  carScan: {
    title: 'Scan my car',
    hint: 'The dash listens to the bus and suggests your car.',
    intro:
      'The dash only listens: it never sends on the bus. It finds the bus speed, then the frames your car sends, in about 5 seconds. Nothing changes on the dash until you pick a car and send the setup.',
    start: 'Start scan',
    again: 'Scan again',
    connectFirst: 'Connect the dash to scan.',
    starting: 'Starting…',
    listeningAt: (kbps: number): string => `Listening at ${String(kbps)} kbit/s`,
    readingAt: (kbps: number): string => `Reading frames at ${String(kbps)} kbit/s`,
    step: (step: number, steps: number): string => `Step ${String(step)} of ${String(steps)}`,
    matching: 'Matching against the catalogue…',
    busSpeed: (kbps: number): string => `${String(kbps)} kbit/s`,
    busSpeedLabel: 'Bus speed',
    frameIds: (count: number): string =>
      count === 1 ? '1 frame ID' : `${String(count)} frame IDs`,
    silent: 'The bus is silent. Turn the ignition on and check the CAN wiring.',
    unclear:
      'There is traffic, but no supported speed (125 to 1000 kbit/s) reads cleanly. Check the CAN wiring and the termination.',
    failed:
      'The dash could not switch its CAN driver. Try again, and reboot the dash if it keeps failing.',
    noMatch: 'No car in the catalogue matches these frames. You can map them in Raw CAN frames.',
    truncated: 'Busy bus: only the first 128 frame IDs were kept.',
    suggestions: 'Suggested cars',
    strong: 'Strong match',
    possible: 'Possible match',
    framesSeen: (matched: number, total: number): string =>
      `${String(matched)} of ${String(total)} frames seen`,
    review: 'Review',
    applySpeed: (kbps: number): string => `Use ${String(kbps)} kbit/s`,
    speedInUse: 'The dash is already set to this speed.',
    speedStaged: 'Bus speed set. Send the setup to apply it.',
  },
} as const
