import { z } from "zod";

export const updateUserSchema = z
  .object({
    fullName: z.string().optional(),
    newsletterOptIn: z.boolean().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    bio: z.string().optional(),
    birthDate: z.string().optional(),
  })
  .strict();
