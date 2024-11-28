import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "./(routes)/auth/auth.module";
import { EnsemblesModule } from "./(routes)/ensembles/ensembles.module";
import { UsersEnsemblesModule } from "./(routes)/user-ensembles/user-ensembles.module";
import { UsersModule } from "./(routes)/users/users.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { env } from "./util/env";

@Module({
  imports: [
    MongooseModule.forRoot(env.DATABASE_URL),
    EnsemblesModule,
    AuthModule,
    UsersModule,
    AuthModule,
    UsersEnsemblesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestModule {}
