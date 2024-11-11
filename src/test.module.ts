import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EnsemblesModule } from "./ensembles/ensembles.module";
import { env } from "./util/env";

@Module({
  imports: [MongooseModule.forRoot(env.DATABASE_URL), EnsemblesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class TestModule {}
