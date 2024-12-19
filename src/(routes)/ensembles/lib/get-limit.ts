import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function getLimit(limit: unknown, defaultLimit = 10) {
  const schema = z.coerce.number().int().positive().default(defaultLimit);
  try {
    return schema.parse(limit);
  } catch (error) {
    console.error(error);
    throw new BadRequestException("Invalid parameter: limit");
  }
}
