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

import { EnsemblesService } from "./ensembles.service";
import { getId } from "./lib/get-id";
import { getLimit } from "./lib/get-limit";
import { getPage } from "./lib/get-page";

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

  @Post("/:id")
  async createEnsemble(@Param("id") id: string, @Body() body: unknown) {
    const idValue = getId(id);
    const ensemble = await this.ensemblesService.findById(idValue);
    if (ensemble) {
      throw new NotFoundException("Ensemble already exists");
    }
    return this.ensemblesService.addEnsemble({ _id: idValue });
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
