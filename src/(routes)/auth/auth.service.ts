import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "../users/users.service";
import { verifyPassword } from "./constants/auth";
import type { SignUpRequestBodySchema } from "./lib/validation-schemas";
import type { JwtPayload, JwtToken } from "./types/types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<JwtToken> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!verifyPassword({ password, storedPassword: user.password })) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id, email: user.email };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(user: SignUpRequestBodySchema): Promise<{ token: string }> {
    const existingUser = await this.usersService.findOne(user.email);

    if (existingUser) {
      throw new ConflictException();
    }

    const timestamp = new Date().toISOString();

    const newUser = await this.usersService.createOne({
      ...user,
      acceptedTocAt: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
      newsletterOptInAt: user.newsletterOptInAt ? timestamp : undefined,
    });

    const payload: JwtPayload = {
      sub: newUser._id.toString(),
      email: user.email,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getLoggedInUser(email: string) {
    return this.usersService.findOne(email);
  }
}
