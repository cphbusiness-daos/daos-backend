import { pbkdf2Sync, randomBytes } from "crypto";
import type { Response } from "express";

import { env } from "../../util/env";
import type { JwtToken } from "../types/types";

export function hashPassword({
  password,
  salt = randomBytes(16).toString("hex"),
}: {
  password: string;
  salt?: string;
}): string {
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword({
  storedPassword,
  password,
}: {
  storedPassword: string;
  password: string;
}): boolean {
  const [salt, hash] = storedPassword.split(":");
  const hashedPassword = pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    "sha512",
  ).toString("hex");
  return hash === hashedPassword;
}

export function sendAuthCookie({
  res,
  token,
}: {
  res: Response;
  token: JwtToken;
}) {
  res.cookie("auth", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * env.AUTH_COOKIE_EXPIRATION, // env.AUTH_COOKIE_EXPIRATION in days
    value: { ...token },
  });
}
