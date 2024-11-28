import { z } from "zod";

export const loginRequestBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type LoginRequestBodySchema = z.infer<typeof loginRequestBodySchema>;

export const signUpRequestBodySchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string(),
  acceptedToc: z.boolean(),
  newsletterOptInAt: z.boolean().optional(),
});
export type SignUpRequestBodySchema = z.infer<typeof signUpRequestBodySchema>;
