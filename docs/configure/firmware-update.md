# Firmware update

**Device → Firmware update** installs a new firmware on a connected dash, over its Wi-Fi or over USB.

1. Download the app-only firmware `.bin` from [canshift-firmware releases](https://github.com/CANShift/canshift-firmware/releases) while you still have internet, and check its signature against the release's `.sig` ([Firmware signing](https://github.com/CANShift/canshift-firmware/blob/main/docs/reference/firmware-signing.md)).
2. Choose the file. The tuner refuses a merged or bootloader image before sending anything, and shows the file's size and version next to the version the dash is running.
3. Press **Install**. The tuner declares the size and SHA-256, streams the image in 512-byte chunks and shows the progress.
4. The dash writes into its spare app slot, checks the SHA-256 of what arrived, then restarts into the new firmware. The tuner reconnects on its own and the running version updates.

If the dash refuses the update, the reason shows in the section. A refused or interrupted update leaves the dash on the firmware it was running.

> [!NOTE]
> The dash checks that the image arrived intact (SHA-256), not who signed it. Check the signature on the downloaded file before installing it.
