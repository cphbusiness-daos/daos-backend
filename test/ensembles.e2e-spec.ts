import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { type Server } from "http";
import request from "supertest";

import { type Ensemble } from "~/(routes)/ensembles/ensembles.schema";

import { AuthService } from "../src/(routes)/auth/auth.service";
import { EnsemblesService } from "../src/(routes)/ensembles/ensembles.service";
import type { CreateEnsembleBody } from "../src/(routes)/ensembles/lib/validation-schemas";
import { UserEnsemblesService } from "../src/(routes)/user-ensembles/user-ensembles.service";
import { UsersService } from "../src/(routes)/users/users.service";
import { TestModule } from "../src/test.module";
import { mockEnsembles } from "./mocks/ensembles.mock";
import { testLogin } from "./util/auth-helper";

describe("EnsemblesController (e2e)", () => {
  let app: INestApplication<Server>;
  let ensemblesService: EnsemblesService;
  let userEnsembleService: UserEnsemblesService;
  let authService: AuthService;
  let userService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    ensemblesService ??= moduleFixture.get<EnsemblesService>(EnsemblesService);
    userEnsembleService ??=
      moduleFixture.get<UserEnsemblesService>(UserEnsemblesService);
    authService ??= moduleFixture.get<AuthService>(AuthService);
    userService ??= moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();

    await ensemblesService.deleteAll();
    await app.init();

    await request(app.getHttpServer()).post("/v1/auth/signup").send({
      fullName: "Test User",
      email: "email@email.com",
      password: "password",
      acceptedToc: true,
    });
  });

  afterEach(async () => {
    await ensemblesService.deleteAll();
    await userEnsembleService.deleteMany();
  });

  afterAll(async () => {
    await userService.deleteMany();
    await app.close();
  });

  describe("GET /v1/ensembles/:id", () => {
    it("should return the ensemble with the given id", async () => {
      // Arrange
      const token = await testLogin(app);

      const ensemble = await ensemblesService.insertOne(mockEnsembles[0]);
      const expected = mockEnsembles[0];

      // Act
      const response = await request(app.getHttpServer())
        .get(`/v1/ensembles/${String(ensemble._id)}`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(expected);
    });

    it("should return 400 when an invalid id is provided", async () => {
      // Act
      const token = await testLogin(app);

      const response = await request(app.getHttpServer())
        .get("/v1/ensembles/invalid")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: id",
        error: "Bad Request",
      });
    });

    it("should return 404 when no ensemble is found", async () => {
      // Act
      const token = await testLogin(app);

      const response = await request(app.getHttpServer())
        .get("/v1/ensembles/123456789012345678901234")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: "Ensemble not found",
      });
    });

    it("should return 404 when no ensemble is found but is deactivated", async () => {
      // Arrange
      const token = await testLogin(app);

      const ensemble = await ensemblesService.insertOne({
        ...mockEnsembles[0],
        deactivated_at: new Date().toISOString(),
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/v1/ensembles/${String(ensemble._id)}`)
        .set("Authorization", `Bearer ${token}`);

      // // Assert
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: "Ensemble not found",
      });
    });

    it("should return 400 when the id is too long", async () => {
      // Arrange
      const token = await testLogin(app);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles/1234567890123456789012345")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: id",
      });
    });

    it("should return 401 when unauthorized", async () => {
      // Arrange
      const ensemble = await ensemblesService.insertOne(mockEnsembles[0]);

      // Act
      const response = await request(app.getHttpServer()).get(
        `/v1/ensembles/${String(ensemble._id)}`,
      );

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });
  });

  describe("GET /v1/ensembles", () => {
    it("should return 200 when no page or limit is provided", async () => {
      // Arrange
      const token = await testLogin(app);
      await ensemblesService.insertMany(mockEnsembles);
      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 200 when a page is provided", async () => {
      // Arrange
      const token = await testLogin(app);

      const page = 1;
      await ensemblesService.insertMany(mockEnsembles);
      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ page })
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 200 when a limit is provided", async () => {
      // Arrange
      const token = await testLogin(app);

      const limit = 10;
      await ensemblesService.insertMany(mockEnsembles);
      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit })
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 200 when a page and limit are provided", async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      await ensemblesService.insertMany(mockEnsembles);
      const token = await testLogin(app);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit, page })
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 400 when an invalid page is provided", async () => {
      // Act
      const token = await testLogin(app);
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ page: "invalid" })
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: page",
        error: "Bad Request",
      });
    });

    it("should return 400 when an invalid limit is provided", async () => {
      // Arrange
      const token = await testLogin(app);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit: "invalid" })
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: limit",
        error: "Bad Request",
      });
    });

    it("should return 404 when no ensembles are found", async () => {
      // Arrange
      const token = await testLogin(app);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: "No ensembles found",
      });
    });

    test("should return 401 when unauthorized", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/v1/ensembles");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });
  });

  describe("DELETE /v1/ensembles/:id", () => {
    it("should return 200 when the ensemble is successfully deactivated", async () => {
      const token = await testLogin(app);

      // Arrange
      const ensemble = await ensemblesService.insertOne(mockEnsembles[0]);
      const response = await request(app.getHttpServer())
        .delete(`/v1/ensembles/${String(ensemble._id)}`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(mockEnsembles[0]);
    });

    test("should return 400 when an invalid id is provided", async () => {
      // Arrange
      const token = await testLogin(app);

      // Act
      const response = await request(app.getHttpServer())
        .delete("/v1/ensembles/invalid")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: id",
        error: "Bad Request",
      });
    });

    test("should return 401 when unauthorized", async () => {
      // Arrange
      const ensemble = await ensemblesService.insertOne(mockEnsembles[0]);

      // Act
      const response = await request(app.getHttpServer()).delete(
        `/v1/ensembles/${String(ensemble._id)}`,
      );

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });
  });

  describe("POST /v1/ensembles", () => {
    it("should return 201 when the ensemble is successfully created", async () => {
      // Arrange
      const token = await testLogin(app);
      const user = (await userService.findOne("email@email.com"))!.toObject();

      const ensemble: Ensemble = {
        ...mockEnsembles[0],
        admin_user_id: user._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        created_at: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updated_at: expect.any(String),
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/ensembles")
        .send(ensemble)
        .set("Authorization", `Bearer ${token}`);
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(
        ensemble satisfies CreateEnsembleBody,
      );
    });

    it("should return 400 when the ensemble is invalid", async () => {
      // Arrange
      const token = await testLogin(app);
      const ensemble = {
        ...mockEnsembles[0],
        // @ts-expect-error - intentionally invalid
        name: undefined,
      } satisfies CreateEnsembleBody;

      const response = await request(app.getHttpServer())
        .post("/v1/ensembles")
        .send(ensemble)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: "Validation failed",
      });
    });

    test("should return 401 when unauthorized", async () => {
      // Arrange
      const ensemble = mockEnsembles[0];

      // Act
      const response = await request(app.getHttpServer())
        .post("/v1/ensembles")
        .send(ensemble);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });
  });
});
