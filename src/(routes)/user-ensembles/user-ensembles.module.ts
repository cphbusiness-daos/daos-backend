import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { InstrumentsModule } from "../instruments/instruments.module";
import { UsersModule } from "../users/users.module";
import { UserEnsemblesController } from "./user-ensembles.controller";
import { UserEnsemble, UserEnsembleSchema } from "./user-ensembles.schema";
import { UserEnsemblesService } from "./user-ensembles.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEnsemble.name, schema: UserEnsembleSchema },
    ]),
    AuthModule,
    UsersModule,
    InstrumentsModule,
  ],
  controllers: [UserEnsemblesController],
  providers: [UserEnsemblesService],
  exports: [UserEnsemblesService],
})
export class UsersEnsemblesModule {}
