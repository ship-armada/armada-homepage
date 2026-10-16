/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_APP_ORIGIN?: string
  /** Ethereum mainnet RPC for the allocation page. Public — baked into the bundle at build time. */
  readonly VITE_MAINNET_RPC_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
