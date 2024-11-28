import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().transform((val) => {
      const isProduction = process.env.NODE_ENV === "production";

      if (isProduction) {
        return `${val}/prod`;
      }
      const isTest = process.env.NODE_ENV === "test";

      if (isTest) {
        return `${val}/test`;
      }

      return `${val}/dev`;
    }),
    JWT_SECRET: z.string().default("secret"),
    AUTH_COOKIE_EXPIRATION: z.coerce.number().default(1),
    DAOS_FRONTEND_URL: z.string().default("http://localhost:5173"),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
