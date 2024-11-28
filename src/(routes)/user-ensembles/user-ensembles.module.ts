import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserEnsemble, UserEnsembleSchema } from "./user-ensembles.schema";
import { UserEnsemblesService } from "./user-ensembles.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEnsemble.name, schema: UserEnsembleSchema },
    ]),
  ],
  providers: [UserEnsemblesService],
  exports: [UserEnsemblesService],
})
export class UsersEnsemblesModule {}
