interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PORT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
