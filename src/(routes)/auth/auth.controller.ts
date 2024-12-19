import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import { validate } from "../../util/validation";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { hashPassword, sendAuthCookie, verifyPassword } from "./constants/auth";
import {
  loginRequestBodySchema,
  signUpRequestBodySchema,
  updatePasswordSchema,
} from "./lib/validation-schemas";
import type { RequestWithUser } from "./types/types";

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

  @UseGuards(AuthGuard)
  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("auth");
    return { message: "OK" };
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() req: { user?: unknown }) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getUser(@Request() req: RequestWithUser) {
    const user = await this.authService.getLoggedInUser(req.user.email);

    if (!user) {
      // should not happen, but if it does - throw 418
      throw new HttpException("User not found", HttpStatus.I_AM_A_TEAPOT);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- password is removed from the response
    const { password, ...rest } = user.toObject();
    return rest;
  }

  @UseGuards(AuthGuard)
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Request() req: RequestWithUser, @Body() body: unknown) {
    const user = await this.authService.getLoggedInUser(req.user.email);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const { password, newPassword } = validate({
      schema: updatePasswordSchema,
      value: body,
    });

    if (!verifyPassword({ password, storedPassword: user.password })) {
      throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = hashPassword({ password: newPassword });

    if (
      verifyPassword({
        password: newPassword,
        storedPassword: user.password,
      }) ===
      verifyPassword({ password: newPassword, storedPassword: hashedPassword })
    ) {
      throw new HttpException(
        "New password cannot be the same as the old one",
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.authService.updatePassword({
      newPassword: hashedPassword,
      userId: user._id,
    });

    if (!updatedUser) {
      throw new HttpException(
        "Failed to update password",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: "OK" };
  }
}
