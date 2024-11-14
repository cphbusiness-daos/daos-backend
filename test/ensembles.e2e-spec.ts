import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { type Server } from "http";
import * as request from "supertest";

import { EnsemblesService } from "../src/ensembles/ensembles.service";
import { TestModule } from "../src/test.module";
import { mockEnsembles } from "./mocks/ensembles.mock";

describe("EnsemblesController (e2e)", () => {
  let app: INestApplication<Server>;
  let ensemblesService: EnsemblesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    ensemblesService ??= moduleFixture.get<EnsemblesService>(EnsemblesService);

    app = moduleFixture.createNestApplication();

    await ensemblesService.deleteAll();
    await app.init();
  });

  describe("GET /v1/ensembles/:id", () => {
    it("should return the ensemble with the given id", async () => {
      // Arrange
      const ensemble = await ensemblesService.insertOne(mockEnsembles[0]);
      const expected = mockEnsembles[0];

      // Act
      const response = await request(app.getHttpServer()).get(
        `/v1/ensembles/${String(ensemble._id)}`,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(expected);
    });

    it("should return 400 when an invalid id is provided", async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        "/v1/ensembles/invalid",
      );

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
      const response = await request(app.getHttpServer()).get(
        "/v1/ensembles/123456789012345678901234",
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: "Ensemble not found",
      });
    });

    it("should return 400 when the id is too long", async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        "/v1/ensembles/1234567890123456789012345",
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: id",
      });
    });
  });

  describe("GET /v1/ensembles", () => {
    it("should return 200 when no page or limit is provided", async () => {
      // Arrange
      await ensemblesService.insertMany(mockEnsembles);

      // Act
      const response = await request(app.getHttpServer()).get("/v1/ensembles");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 200 when a page is provided", async () => {
      // Arrange
      const page = 1;
      await ensemblesService.insertMany(mockEnsembles);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ page });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 200 when a limit is provided", async () => {
      // Arrange
      const limit = 10;
      await ensemblesService.insertMany(mockEnsembles);

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit });

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

      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit, page });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockEnsembles.slice(0, 10),
        length: 10,
      });
    });

    it("should return 400 when an invalid page is provided", async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ page: "invalid" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: page",
        error: "Bad Request",
      });
    });

    it("should return 400 when an invalid limit is provided", async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get("/v1/ensembles")
        .query({ limit: "invalid" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: "Invalid parameter: limit",
        error: "Bad Request",
      });
    });

    it("should return 404 when no ensembles are found", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/v1/ensembles");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        message: "No ensembles found",
      });
    });
  });
});
