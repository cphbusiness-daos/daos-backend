import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export function getId(id: unknown) {
  const schema = z.coerce.string().min(24).max(24); // 24 characters long for id

  try {
    return schema.parse(id);
  } catch (error) {
    console.error(error);
    throw new BadRequestException("Invalid parameter: id");
  }
}
