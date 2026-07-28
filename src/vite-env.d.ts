/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENHA_ACESSO?: string;
  readonly VITE_SENHA1?: string;
  readonly VITE_SENHA2?: string;
  readonly VITE_SENHA3?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
