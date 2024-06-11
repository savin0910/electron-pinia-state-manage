import 'pinia';

declare module 'pinia' {
  export interface PiniaSyncPluginOptions {
    exclude?: string[];
  }

  export interface DefineStoreOptionsBase {
    sync?: PiniaSyncPluginOptions;
  }
}
