# Firmware update

**Dash → Update firmware** (`/dash/firmware`) installs a new firmware on a connected dash.

1. While you still have internet, download two files from the same [canshift-firmware release](https://github.com/CANShift/canshift-firmware/releases): the firmware `canshift-<chip>-v<x.y.z>-firmware.bin` and its signature, `canshift-<chip>-v<x.y.z>-firmware.bin.sig`.
2. Choose the **Firmware file (.bin)** and the **Signature file (.sig)**, each with its own picker. **Install update** stays disabled until both are chosen. The tuner refuses a file that isn't an app image, or a signature of the wrong size, before sending anything.
3. Press **Install update**. A confirmation names the version and what happens: the dash restarts and is unusable for about two minutes; your settings are kept.
4. The update runs on a locked full screen: **Uploading** (with the MB sent) → **Checking the signature** → **Installing** → **Restarting the dash**. Keep the car's power on and the page open. **Cancel upload** works during the upload only; nothing is installed yet at that point.
5. After the restart the tuner reconnects on its own and shows the new version. If it doesn't reconnect, it says: **On the dash, tap Workshop mode to reconnect**.

## When it fails

A failure always says whether the dash still runs the old version. The common ones:

| Message                                                     | What to do                                       |
| ----------------------------------------------------------- | ------------------------------------------------ |
| The signature file doesn't match the firmware file.         | Download both files again from the same release. |
| The Wi-Fi dropped during the upload. Nothing was installed. | Reconnect and try again.                         |
| This file is for a different dash.                          | Download the file for your dash's chip.          |

> [!NOTE]
> You do not check the signature yourself: the dash does. It refuses an image without a signature, and an image whose signature does not match the release key never becomes bootable ([Firmware signing](https://github.com/CANShift/canshift-firmware/blob/main/docs/reference/firmware-signing.md)).
