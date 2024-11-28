import type { CookieOptions, Request } from "express";

export type JwtPayload = {
  sub: string;
  email: string;
};

export type JwtToken = {
  token: string;
};

export type AuthCookie = CookieOptions & {
  token: string;
};

export type RequestWithUser = Request & {
  user: JwtPayload;
};
