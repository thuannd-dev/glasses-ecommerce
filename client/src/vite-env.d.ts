/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_LOCATIONIQ_API_KEY?: string;
  readonly VITE_GHN_API_URL?: string;
  readonly VITE_GHN_TOKEN?: string;
  readonly VITE_GHN_SHOP_ID?: string;
  readonly VITE_GHN_FROM_DISTRICT_ID?: string;
  readonly VITE_GHN_FROM_WARD_CODE?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_API_URL?: string;
  readonly VITE_OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
