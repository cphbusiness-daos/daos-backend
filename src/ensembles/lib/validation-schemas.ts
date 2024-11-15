import { z } from "zod";

export const createEnsembleBodySchema = z.object({
  name: z.string(),
  imageUrl: z.string().url(),
  description: z.string(),
  website: z.string().url(),
  zip_code: z.string(),
  city: z.string(),
  active_musicians: z.enum(["1-4", "5-9", "10-24", "25-49", "50+"]),
  practice_frequency: z.enum([
    "daily",
    "weekly",
    "bi-weekly",
    "monthly",
    "bi-monthly",
  ]),
  ensemble_type: z.array(z.enum(["continuous", "project_based"])),
  genre: z.array(
    z.enum([
      "baroque",
      "folk",
      "chamber",
      "romantic",
      "late-modern",
      "late-romantic",
      "symphonic",
    ]),
  ),
  admin_user_id: z.string(),
});

export type CreateEnsembleBody = z.infer<typeof createEnsembleBodySchema>;
