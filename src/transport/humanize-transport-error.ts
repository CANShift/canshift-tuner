export const UNKNOWN_TRANSPORT_ERROR = 'Something went wrong talking to the dash. Try again.'

export const TRANSPORT_ERROR_MESSAGES: Record<string, string> = {
  replaced: 'Another device is connected to the dash.',
  no_port_selected: 'No port selected — press Connect and pick your dash.',
  webserial_unavailable:
    'WebSerial is not available in this browser — use Chrome, Edge, Brave or Opera.',
  streams_unavailable:
    'The port opened but exposes no data streams — unplug/replug the dash and try again.',
  connection_closed:
    'The connection to the dash was closed — check the cable or the dash’s Wi-Fi and reconnect.',
  auto_reconnect_failed: 'Automatic reconnect failed — press Connect to try again.',
  connect_failed:
    'Could not connect to the dash — check the cable or the dash’s Wi-Fi and try again.',
  open_failed:
    'Could not open the port or the file on the dash — unplug/replug the dash and try again.',
  ack_timeout: 'The dash did not respond in time — check the link and retry.',
  not_connected: 'No dash connected — connect the device first.',
  disconnected: 'The dash was disconnected before it could respond.',
  queue_full: 'The dash is busy with other commands — wait a moment and retry.',
  read_error: 'Lost the data stream while reading — check the link and reconnect.',
  send_failed: 'Sending to the dash failed — check the link and retry.',
  device_error: 'The dash reported an error. Try again.',
  unknown_error: 'Something went wrong on the dash. Try again.',
  read_failed: 'Could not read the trouble codes from the dash — check the link and retry.',
  clear_failed: 'The dash refused to clear the trouble codes — check the link and retry.',
  fetch_failed: 'Could not fetch that from the dash — check the link and retry.',
  invalid_device_config: 'The dash rejected that device setting — pick another value and retry.',
  unknown_command: 'This dash firmware does not know that command yet. Update the firmware.',
  bus_scan_busy: 'The dash is already scanning. Wait for it to finish.',
  bus_scan_timeout: 'The scan did not finish in time. Try again.',
  bus_scan_too_long: 'The scan result was too large to send. Try again.',
  invalid_bus_scan_reply: 'The dash sent a scan result this tuner cannot read. Update the tuner.',
  can_unavailable: 'The dash’s CAN driver is down. Check the wiring and reboot the dash.',
  out_of_memory: 'The dash ran out of memory. Reboot it and try again.',
  invalid_board_profile:
    'The firmware rejected this board profile — re-check the board definition and re-provision.',
}

export const humanizeTransportError = (code: string): string => {
  const exact = TRANSPORT_ERROR_MESSAGES[code]
  if (exact !== undefined) return exact
  const lower = code.toLowerCase()
  if (lower.includes('failed to open') || lower.includes('already open')) {
    return 'Port busy — close other apps using it (PlatformIO Monitor, Arduino IDE, `screen`, another browser tab) and press Connect again.'
  }
  if (lower.includes('notfounderror') || lower.includes('not found')) {
    return 'Device not found — check the cable and unplug/replug the dash.'
  }
  if (lower.includes('access denied') || lower.includes('permission')) {
    return 'Permission denied — press Connect and grant access again.'
  }
  console.warn(`[transport] no plain message for ${code}`)
  return UNKNOWN_TRANSPORT_ERROR
}

export const transportErrorText = (code: string | undefined | null): string =>
  humanizeTransportError(
    code === undefined || code === null || code.length === 0 ? 'unknown_error' : code
  )
