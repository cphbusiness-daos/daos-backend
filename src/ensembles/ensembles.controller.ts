import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from "@nestjs/common";

import { validate } from "../util/validation";
import { EnsemblesService } from "./ensembles.service";
import { getId } from "./lib/get-id";
import { getLimit } from "./lib/get-limit";
import { getPage } from "./lib/get-page";
import { createEnsembleBodySchema } from "./lib/validation-schemas";

@Controller("v1/ensembles")
export class EnsemblesController {
  constructor(private ensemblesService: EnsemblesService) {}

  @Get("/")
  async getEnsembles(
    @Query("page") page: string,
    @Query("limit") limit: string,
  ) {
    const ensembles = await this.ensemblesService.findAll({
      page: getPage(page),
      limit: getLimit(limit),
    });

    if (ensembles.length === 0) {
      throw new NotFoundException("No ensembles found");
    }

    return {
      data: ensembles,
      length: ensembles.length,
    };
  }

  @Get("/:id")
  async getEnsemble(@Param("id") id: string) {
    const idValue = getId(id);
    const ensemble = await this.ensemblesService.findById(idValue);
    if (!ensemble) {
      throw new NotFoundException("Ensemble not found");
    }
    return ensemble;
  }

  @Post("/")
  async createEnsemble(@Body() createEnsembleBody: unknown) {
    const body = validate({
      schema: createEnsembleBodySchema,
      value: createEnsembleBody,
    });

    // TODO: Add validation whether the user already exists

    const timestamp = new Date().toISOString();
    return this.ensemblesService.insertOne({
      ...body,
      created_at: timestamp,
      updated_at: timestamp,
    });
  }

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
