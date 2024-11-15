import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { EnsemblesModule } from "./ensembles/ensembles.module";
import { UsersModule } from "./users/users.module";
import { env } from "./util/env";

@Module({
  imports: [
    MongooseModule.forRoot(env.DATABASE_URL),
    EnsemblesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
