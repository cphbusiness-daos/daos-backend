import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { InstrumentsService } from "./instruments.service";

@Controller("v1/instruments")
export class InstrumentsController {
  constructor(private instrumentService: InstrumentsService) {}

  @UseGuards(AuthGuard)
  @Get("/")
  async getInstruments() {
    return {
      data: await this.instrumentService.findAll(),
      total: await this.instrumentService.count(),
    };
  }
}
