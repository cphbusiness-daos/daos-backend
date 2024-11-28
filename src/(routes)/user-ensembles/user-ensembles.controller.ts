import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Request,
  UseGuards,
} from "@nestjs/common";

import { mongoIdSchema } from "../../schemas/mongo.id";
import { validate } from "../../util/validation";
import { AuthGuard } from "../auth/auth.guard";
import { RequestWithUser } from "../auth/types/types";
import { UserEnsemblesService } from "../user-ensembles/user-ensembles.service";

@Controller("v1/user-ensembles")
export class UserEnsemblesController {
  constructor(private userEnsemblesService: UserEnsemblesService) {}

  @UseGuards(AuthGuard)
  @Get("/ensembles/:ensembleId")
  async getEnsemblesForUser(
    @Param("ensembleId") ensembleId: string,
    @Request() request: RequestWithUser,
  ) {
    validate({ schema: mongoIdSchema, value: request.user.sub });
    validate({ schema: mongoIdSchema, value: ensembleId });

    const userEnsemble = await this.userEnsemblesService.findOne({
      ensembleId,
      userId: request.user.sub,
    });

    if (!userEnsemble) {
      throw new NotFoundException("No user ensemble found");
    }

    return userEnsemble;
  }
}
