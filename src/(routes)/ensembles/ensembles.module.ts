import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { UsersEnsemblesModule } from "../user-ensembles/user-ensembles.module";
import { UsersModule } from "../users/users.module";
import { EnsemblesController } from "./ensembles.controller";
import { Ensemble, EnsembleSchema } from "./ensembles.schema";
import { EnsemblesService } from "./ensembles.service";

@Module({
  imports: [
    UsersEnsemblesModule,
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Ensemble.name, schema: EnsembleSchema },
    ]),
  ],
  controllers: [EnsemblesController],
  providers: [EnsemblesService],
})
export class EnsemblesModule {}
