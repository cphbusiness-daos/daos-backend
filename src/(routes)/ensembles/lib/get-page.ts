import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function getPage(page: unknown) {
  const schema = z.coerce.number().int().positive().default(1);
  try {
    return schema.parse(page);
  } catch (error) {
    console.error(error);
    throw new BadRequestException("Invalid parameter: page");
  }
}
