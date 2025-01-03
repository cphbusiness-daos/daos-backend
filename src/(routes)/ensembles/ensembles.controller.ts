import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { mongoIdSchema } from "../../schemas/mongo.id";
import { validate } from "../../util/validation";
import { AuthGuard } from "../auth/auth.guard";
import { RequestWithUser } from "../auth/types/types";
import { UserEnsemblesService } from "../user-ensembles/user-ensembles.service";
import { UsersService } from "../users/users.service";
import { EnsemblesService } from "./ensembles.service";
import { getId } from "./lib/get-id";
import { getLimit } from "./lib/get-limit";
import { getPage } from "./lib/get-page";
import {
  createEnsembleBodySchema,
  updateEnsembleBodySchema,
} from "./lib/validation-schemas";

@Controller("v1/ensembles")
export class EnsemblesController {
  constructor(
    private ensemblesService: EnsemblesService,
    private userEnsemblesService: UserEnsemblesService,
    private userService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("/")
  async getEnsembles(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("name") name?: string,
    @Query("city") city?: string,
  ) {
    const ensembles = await this.ensemblesService.findAll({
      page: getPage(page),
      limit: getLimit(limit),
      name,
      city,
    });
    const total = await this.ensemblesService.count({ name, city });

    if (ensembles.length === 0) {
      throw new NotFoundException("No ensembles found");
    }

    return {
      data: ensembles,
      length: ensembles.length,
      total,
    };
  }

  @UseGuards(AuthGuard)
  @Get("/users/:userId")
  async getEnsemblesForUser(
    @Param("userId") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    validate({ schema: mongoIdSchema, value: userId });

    const userEnsembles = await this.userEnsemblesService.findByUserId({
      userId,
      page: getPage(page),
      limit: getLimit(limit, 5),
    });

    const total = await this.userEnsemblesService.countByUserId(userId);

    if (!userEnsembles || userEnsembles.length === 0) {
      throw new NotFoundException("No ensembles found");
    }

    const userEnsembleIds = userEnsembles.map(
      (userEnsemble) => userEnsemble.toObject().ensemble_id,
    );

    const ensembles = await this.ensemblesService.findByIds({
      userEnsembleIds,
    });

    if (!ensembles || ensembles.length === 0) {
      throw new NotFoundException("No ensembles found");
    }

    return {
      data: ensembles,
      length: ensembles.length,
      total,
    };
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getEnsemble(@Param("id") id: string) {
    const idValue = getId(id);
    const ensemble = await this.ensemblesService.findById(idValue);

    if (!ensemble) {
      throw new NotFoundException("Ensemble not found");
    }

    const admin = await this.userService.findById(ensemble.admin_user_id);
    if (!admin) {
      return ensemble.toObject();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, created_at, acceptedTocAt, updated_at, ...adminUser } =
      admin.toObject();

    return {
      ...ensemble.toObject(),
      admin: adminUser,
    } as const;
  }

  @UseGuards(AuthGuard)
  @Post("/")
  async createEnsemble(
    @Request() req: RequestWithUser,
    @Body() createEnsembleBody: unknown,
  ) {
    const body = validate({
      schema: createEnsembleBodySchema,
      value: createEnsembleBody,
    });

    const timestamp = new Date().toISOString();
    const createdEnsemble = await this.ensemblesService.insertOne({
      ...body,
      admin_user_id: req.user.sub,
      created_at: timestamp,
      updated_at: timestamp,
    });

    await this.userEnsemblesService.createOne({
      userId: req.user.sub,
      ensembleId: createdEnsemble._id.toString(),
    });

    return createdEnsemble;
  }

  @UseGuards(AuthGuard)
  @Put("/:id")
  async updateEnsemble(
    @Param("id") id: string,
    @Body() updateEnsembleBody: unknown,
  ) {
    const idValue = getId(id);
    const body = validate({
      schema: updateEnsembleBodySchema,
      value: updateEnsembleBody,
    });

    const ensemble = await this.ensemblesService.updateOne({
      id: idValue,
      ensemble: body,
    });

    if (!ensemble) {
      throw new NotFoundException("Ensemble not found");
    }

    return ensemble;
  }

  @UseGuards(AuthGuard)
  @Post("/:ensembleId")
  async addUserToEnsemble(
    @Request() req: RequestWithUser,
    @Param("ensembleId") ensembleId: string,
  ) {
    validate({ schema: mongoIdSchema, value: req.user.sub });
    validate({ schema: mongoIdSchema, value: ensembleId });

    const ensemble = await this.ensemblesService.findById(ensembleId);
    if (!ensemble) {
      throw new NotFoundException("Ensemble not found");
    }

    const alreadyInEnsemble = await this.userEnsemblesService.findOne({
      ensembleId,
      userId: req.user.sub,
    });

    if (alreadyInEnsemble) {
      throw new UnauthorizedException("User already in this ensemble");
    }

    await this.userEnsemblesService.createOne({
      userId: req.user.sub,
      ensembleId,
    });

    return { message: "OK" } as const;
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async deleteEnsemble(@Param("id") id: string) {
    const idValue = getId(id);
    const ensemble = await this.ensemblesService.findById(idValue);
    if (!ensemble) {
      throw new NotFoundException("Ensemble not found");
    }
    await this.ensemblesService.softDeleteOne(idValue);
    return ensemble;
  }
}
