import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { UsersService } from "../users/users.service";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_JWT_SECRET } from "./constants/constants";
import type { AuthCookie, JwtPayload } from "./types/types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: DO_NOT_USE_OR_YOU_WILL_BE_FIRED_JWT_SECRET.secret,
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    await this.verifyUser(request.user);

    return true;
  }

  private extractToken(
    request: Request & { cookies?: { auth?: AuthCookie } },
  ): string | undefined {
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const [type, token] = authHeader.split(" ");
      if (type === "Bearer") {
        return token;
      }
    }
    // If token is not in Authorization header, check cookies
    return request.cookies?.auth?.token;
  }

  private async verifyUser(token: JwtPayload) {
    const user = await this.userService.findOne(token.email);

    if (!user || user.id !== token.sub) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
