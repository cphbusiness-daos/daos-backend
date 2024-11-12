import { Controller, Get, NotFoundException, Query } from "@nestjs/common";

import { EnsemblesService } from "./ensembles.service";
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
}
