import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { UsersModule } from "../users/users.module";
import { env } from "../util/env";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_JWT_SECRET } from "./constants/constants";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: DO_NOT_USE_OR_YOU_WILL_BE_FIRED_JWT_SECRET.secret,
      signOptions: { expiresIn: `${env.AUTH_COOKIE_EXPIRATION}d` },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
