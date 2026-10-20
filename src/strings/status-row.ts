export const STATUS_ROW = {
  statusRow: {
    menuItem: 'Status row',
    title: 'Status row',
    description:
      'The centre and right fields above this page. The left field is always the bus rate.',
    center: 'Centre',
    right: 'Right',
    kind: 'Shows',
    barDefault: 'Bar default',
    signal: 'Signal',
    prefix: 'Prefix',
    format: 'Format',
    source: 'Source',
    onWord: 'When on',
    offWord: 'When off',
    convertUnits: 'Follow the unit system',
    showUnit: 'Show the unit',
    noPair: 'This signal’s unit has no imperial pair.',
    stale: 'Shows - - while the signal is not being received.',
    kinds: {
      signal: 'Live value',
      signalMax: 'Session max',
      timer: 'Lap timing',
      flagWord: 'Flag as a word',
    },
  },
} as const
