import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";

import { validate } from "../util/validation";
import { AuthService } from "./auth.service";
import { hashPassword, sendAuthCookie } from "./constants/auth";
import {
  loginRequestBodySchema,
  signUpRequestBodySchema,
} from "./lib/validation-schemas";

@Controller("v1/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const body = validate({ schema: loginRequestBodySchema, value: signInDto });

    const token = await this.authService.signIn(body);

    sendAuthCookie({ res, token });
    return token;
  }

  @Post("/signup")
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const body = validate({
      schema: signUpRequestBodySchema,
      value: signUpDto,
    });

    const token = await this.authService.signUp({
      ...body,
      password: hashPassword({ password: body.password }),
    });

    sendAuthCookie({ res, token });
    return token;
  }
}
