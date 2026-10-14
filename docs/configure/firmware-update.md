# Firmware update

**Device → Firmware update** installs a new firmware on a connected dash, over its Wi-Fi or over USB.

1. Download two files from the same [canshift-firmware release](https://github.com/CANShift/canshift-firmware/releases) while you still have internet: the app-only `canshift-<chip>-v<x.y.z>-firmware.bin` and its signature, `canshift-<chip>-v<x.y.z>-firmware.bin.sig`.
2. Press **Choose .bin and .sig…** and select both files together. The tuner refuses a merged or bootloader image, a `.bin` without its `.sig` and a `.sig` that is not 64 bytes before sending anything, and shows the file's size and version next to the version the dash is running.
3. Press **Install**. The tuner declares the size, SHA-256 and signature, streams the image in 512-byte chunks and shows the progress.
4. The dash writes into its spare app slot, checks the SHA-256 of what arrived and verifies the signature against the release key built into its firmware, then restarts into the new firmware. Over USB the tuner reconnects on its own and the running version updates. Over Wi-Fi the dash comes back on its dashboard, not in workshop mode, so the tuner drops the link: enter workshop mode again to reconnect.

If the dash refuses the update, the reason shows in the section. A refused or interrupted update leaves the dash on the firmware it was running.

> [!NOTE]
> You do not check the signature yourself: the dash does. It refuses an image without a signature, and an image whose signature does not match the release key never becomes bootable ([Firmware signing](https://github.com/CANShift/canshift-firmware/blob/main/docs/reference/firmware-signing.md)).
