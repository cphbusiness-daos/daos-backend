import { type INestApplication } from "@nestjs/common";
import { type Server } from "http";
import request from "supertest";

export async function testLogin(app: INestApplication<Server>) {
  const loginRes = await request(app.getHttpServer())
    .post("/v1/auth/login")
    .send({ email: "email@email.com", password: "password" });

  return (loginRes.body as { token: string }).token;
}
