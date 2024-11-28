import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function getLimit(limit: unknown) {
  const schema = z.coerce.number().int().positive().default(10);
  try {
    return schema.parse(limit);
  } catch (error) {
    console.error(error);
    throw new BadRequestException("Invalid parameter: limit");
  }
}
