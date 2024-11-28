import { z } from "zod";

export const mongoIdSchema = z
  .string()
  .min(24)
  .max(24)
  .refine((value) => /^[a-f\d]{24}$/i.test(value), {
    message: "Invalid Mongo ID",
  });
