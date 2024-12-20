import { z } from "zod";

export const createUserInstrumentSchema = z
  .object({
    instrumentId: z.string(),
    experience: z.string(),
    description: z.string(),
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
  })
  .strict();

export const updateUserInstrumentSchema = createUserInstrumentSchema.partial();
