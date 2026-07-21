/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_URL: string
  readonly VITE_AUTH_URL?: string
  readonly VITE_CATALOG_URL?: string
  readonly VITE_ORDER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
