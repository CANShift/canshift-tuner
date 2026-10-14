/// <reference types="vite/client" />

declare const __EXPECTED_FIRMWARE_MAJOR__: number

interface ImportMetaEnv {
  readonly VITE_DASH_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
