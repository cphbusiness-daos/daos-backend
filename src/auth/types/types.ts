import type { CookieOptions } from "express";

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
