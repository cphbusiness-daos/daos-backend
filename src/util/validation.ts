import { BadRequestException } from "@nestjs/common";
import { type z, ZodError, type ZodType } from "zod";

export function validate<T extends ZodType<any, any, any>>({
  schema,
  value,
}: {
  schema: T;
  value: unknown;
}): z.infer<T> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(value) as z.infer<T>;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    throw new BadRequestException("Validation failed");
  }
}
