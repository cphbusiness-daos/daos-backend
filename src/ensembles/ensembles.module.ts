import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { EnsemblesController } from "./ensembles.controller";
import { Ensemble, EnsembleSchema } from "./ensembles.schema";
import { EnsemblesService } from "./ensembles.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ensemble.name, schema: EnsembleSchema },
    ]),
  ],
  controllers: [EnsemblesController],
  providers: [EnsemblesService],
})
export class EnsemblesModule {}
