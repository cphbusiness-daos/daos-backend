import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Server } from "http";
import * as request from "supertest";

import { AuthService } from "../src/auth/auth.service";
import type {
  LoginRequestBodySchema,
  SignUpRequestBodySchema,
} from "../src/auth/lib/validation-schemas";
import { TestModule } from "../src/test.module";
import { UsersService } from "../src/users/users.service";

describe("AuthController (e2e)", () => {
  let app: INestApplication<Server>;
  let authService: AuthService;
  let userService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    authService ??= moduleFixture.get<AuthService>(AuthService);
    userService ??= moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await userService.deleteMany();
  });

  describe("GET /v1/auth/signup", () => {
    it("should return 201 when a user is created", async () => {
      // Arrange
      const body: SignUpRequestBodySchema = {
        email: "email@test.com",
        password: "password",
        acceptedToc: true,
        fullName: "Test User",
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 when the request body is invalid", async () => {
      // Arrange
      // @ts-expect-error - Invalid body
      const body: SignUpRequestBodySchema = {
        email: "email",
        password: "password",
        acceptedToc: true,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return 409 when the user already exists", async () => {
      // Arrange
      const body: SignUpRequestBodySchema = {
        email: "email@test.com",
        password: "password",
        acceptedToc: true,
        fullName: "Test User",
      };

      // Act
      await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      // Assert
      expect(response.status).toBe(409);
    });
  });

  describe("GET /v1/auth/login", () => {
    it("should return 200 when a user logs in", async () => {
      // Arrange
      const body: SignUpRequestBodySchema = {
        email: "email@test.com",
        password: "password",
        acceptedToc: true,
        fullName: "Test User",
      };

      // Act
      await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          email: body.email,
          password: body.password,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 when the request body is invalid", async () => {
      // Arrange
      // @ts-expect-error - Invalid body
      const body: LoginRequestBodySchema = {
        password: "password",
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(body);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return 401 when the user does not exist", async () => {
      // Arrange
      const body: LoginRequestBodySchema = {
        email: "email@test.com",
        password: "password",
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(body satisfies LoginRequestBodySchema);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should return 401 when the password is incorrect", async () => {
      // Arrange
      const body: SignUpRequestBodySchema = {
        email: "email@test.com",
        password: "password",
        acceptedToc: true,
        fullName: "Test User",
      };
      const loginBody: LoginRequestBodySchema = {
        email: body.email,
        password: "incorrect",
      };

      // Act
      await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginBody satisfies LoginRequestBodySchema);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should return 401 when the password is incorrect", async () => {
      // Arrange
      const body: SignUpRequestBodySchema = {
        email: "email@test.com",
        password: "password",
        acceptedToc: true,
        fullName: "Test User",
      };
      const loginBody: LoginRequestBodySchema = {
        email: body.email,
        password: "incorrect",
      };

      // Act
      await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(body satisfies SignUpRequestBodySchema);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginBody satisfies LoginRequestBodySchema);

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
