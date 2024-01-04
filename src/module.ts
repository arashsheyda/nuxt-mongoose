import { defineNuxtModule, logger } from "@nuxt/kit";
import mongoose from "mongoose";

import type { ConnectOptions } from "mongoose";
import type { RuntimeConfig } from "nuxt/schema";

import {
  checkForNewVersion,
  configureMongooseOptions,
  setupAliasesAndImports,
} from "./utils/setupFunctions";

export interface ModuleOptions {
  /**
   *  The MongoDB URI connection
   *
   * @default process.env.MONGODB_URI
   *
   */
  uri: string | undefined;
  /**
   *  Nuxt DevTools
   *
   * @default true
   *
   */
  devtools: boolean;
  /**
   *  Mongoose Connections
   *
   * @default {}
   */
  options?: ConnectOptions;
  /**
   *  Models Directory for auto-import
   *
   * @default 'models'
   *
   */
  modelsDir?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-mongoose",
    configKey: "mongoose",
  },
  defaults: {
    // eslint-disable-next-line n/prefer-global/process
    uri: process.env.MONGODB_URI as string,
    devtools: true,
    options: {},
    modelsDir: "models",
  },
  hooks: {
    close: () => {
      mongoose.disconnect();
    },
  },

  async setup(options, nuxt) {
    if (nuxt.options.dev) {
      await checkForNewVersion();
    }

    const config = await configureMongooseOptions(options, nuxt);

    await setupAliasesAndImports(options, config as RuntimeConfig, nuxt);

    logger.success("`nuxt-mongoose` is ready!");
  },
});
