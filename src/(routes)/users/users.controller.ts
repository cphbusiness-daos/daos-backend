import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import { mongoIdSchema } from "~/schemas/mongo.id";
import { validate } from "~/util/validation";

import { AuthGuard } from "../auth/auth.guard";
import { RequestWithUser } from "../auth/types/types";
import { updateUserSchema } from "./lib/validation-schemas";
import { UsersService } from "./users.service";

@Controller("v1/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getUser(@Param("id") id: string) {
    const userId = validate({ schema: mongoIdSchema, value: id });
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, updated_at, ...userData } = user.toObject();

    return userData;
  }

  @UseGuards(AuthGuard)
  @Put("/")
  async updateUser(
    @Request() req: RequestWithUser,
    @Res() res: Response,
    @Body() updateUserBody: unknown,
  ) {
    const body = validate({ schema: updateUserSchema, value: updateUserBody });

    // If the body is empty, return a 204 No Content response
    if (Object.keys(body).length === 0) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    const newsLetterOptOut = body.newsletterOptIn === false;
    const newsletterOptIn = body.newsletterOptIn === true;

    const user = await this.usersService.updateOne(req.user.sub, {
      ...body,
      newsLetterOptOut,
      newsletterOptInAt: newsletterOptIn ? new Date().toISOString() : undefined,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, created_at, acceptedTocAt, updated_at, ...updatedUser } =
      user.toObject();

    return res.status(HttpStatus.OK).send(updatedUser);
  }

  @UseGuards(AuthGuard)
  @Delete("/")
  async deleteUser(@Request() req: RequestWithUser, @Res() res: Response) {
    const user = await this.usersService.deleteOne(req.user.sub);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
