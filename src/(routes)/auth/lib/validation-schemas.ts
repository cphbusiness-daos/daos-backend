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
  acceptedToc: z.literal(true),
  newsletterOptInAt: z.boolean().optional(),
});
export type SignUpRequestBodySchema = z.infer<typeof signUpRequestBodySchema>;

export const updatePasswordSchema = z.object({
  password: z.string(),
  newPassword: z.string(),
});
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
