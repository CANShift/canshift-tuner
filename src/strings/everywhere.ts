import { plural } from './plural'

export const EVERYWHERE = {
  appName: 'CANShift Tuner',
  tabs: {
    gauges: 'Gauges',
    car: 'Car',
    dash: 'Dash',
  },
  connection: {
    connected: 'Connected',
    reconnecting: 'Reconnecting…',
    offline: 'Not connected',
  },
  sync: {
    onTheDash: 'On the dash',
    notSent: (n: number): string => `${plural(n, 'change', 'changes')} not sent`,
    onlyInBrowser: 'Only in this browser',
    undo: 'Undo',
    undoAll: 'Undo all',
    pull: 'Pull from dash',
    pulled: 'Pulled from the dash',
    compared: {
      identical: 'The dash shows the same gauges as this browser.',
      projectNewer: 'This browser has gauge changes the dash doesn’t have yet.',
      deviceNewer: 'Opened the gauges from the dash. They are newer than what this browser had.',
      differentProject: 'The dash shows different gauges from this browser.',
      deviceEmpty: 'The dash has no gauges set up yet. Send to dash to put these on it.',
    },
    keptHere: 'Kept in this browser. The dash still shows the old setup.',
    inBrowser: (n: number): string => `${plural(n, 'change', 'changes')} in this browser`,
  },
  send: {
    idle: 'Send to dash',
    sending: 'Sending…',
    waiting: 'Send when connected',
    sent: 'Sent. The dash is showing your changes.',
    sentRestarting: 'Sent. The dash restarts to use the new CAN bus speed.',
    sentRestartingCar: 'Sent. The dash restarts to use your car settings.',
    sentRestartingScreen: 'Sent. The dash restarts to turn its screen.',
    sendRest: 'Send again once it is back for the rest.',
    dropped:
      'Couldn’t finish sending — the Wi-Fi dropped. Nothing changed on the dash. Send again once you’re reconnected.',
  },
  reconnectBanner: 'Lost the dash’s Wi-Fi. Reconnecting… Your changes are safe in this browser.',
  notConnected: {
    title: 'Not connected to your dash',
    stepWorkshop: 'On the dash, tap Workshop mode.',
    stepJoin: (ssid: string): string => `Join the Wi-Fi it shows (${ssid}), or scan its QR code.`,
    stepJoinUnknown: 'Join the Wi-Fi it shows, or scan its QR code.',
    stepReturn: 'Come back to this page.',
    tryAgain: 'Try again',
    safe: (n: number): string =>
      `Your ${plural(n, 'change is', 'changes are')} safe in this browser. You can keep editing.`,
    keepEditing: 'Keep editing',
    anotherDevice: 'Another device is connected to the dash',
    anotherDeviceBody:
      'The dash talks to one device at a time. Close the tuner on the other phone or laptop, then try again here.',
  },
  refused: {
    title: 'The dash didn’t accept these changes',
    layoutTitle: 'This layout doesn’t fit the dash',
    body: 'Nothing changed on the dash. Your changes are still here.',
    unknownSignal: (gauge: string, page: string): string =>
      `${gauge} on page ${page} uses a signal your car doesn’t send. Choose another signal or remove the gauge.`,
    tooManyGauges: (page: string): string => `Page ${page} has more gauges than fit. Remove one.`,
    tooWide: (gauge: string, page: string, reading: string): string =>
      `${gauge} on page ${page} is too narrow to show ${reading}. Make it wider or pick a smaller size.`,
    outOfSpace: 'The dash is out of space. Remove a page.',
    newerFirmware: 'This setup was made for newer firmware. Update the dash first.',
    newerDash:
      'This dash runs newer settings than this tuner. Update the tuner (firmware update) before sending changes.',
    fallback: 'The dash couldn’t save this. Try sending again.',
    carSettings: 'The dash couldn’t use these car settings. Nothing changed.',
    layout: 'The dash couldn’t lay out these gauges. Check that each one fits on its page.',
    showMe: 'Show me',
    notNow: 'Not now',
  },
} as const
