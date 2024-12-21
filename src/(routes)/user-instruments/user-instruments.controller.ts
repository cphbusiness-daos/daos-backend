import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";

import { mongoIdSchema } from "../../schemas/mongo.id";
import { validate } from "../../util/validation";
import { AuthGuard } from "../auth/auth.guard";
import type { RequestWithUser } from "../auth/types/types";
import { InstrumentsService } from "../instruments/instruments.service";
import {
  createUserInstrumentSchema,
  updateUserInstrumentSchema,
} from "./lib/validation-schemas";
import { UserInstrumentsService } from "./user-instruments.service";

@Controller("v1/user-instruments")
export class UserInstrumentsController {
  constructor(
    private userInstrumentService: UserInstrumentsService,
    private instrumentService: InstrumentsService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("/")
  async getUserInstruments(@Req() req: RequestWithUser) {
    const userInstruments = await this.userInstrumentService.findByUserId({
      userId: req.user.sub,
    });

    const instruments = (
      await Promise.all(
        userInstruments.map(({ instrumentId }) =>
          this.instrumentService.findOne(instrumentId),
        ),
      )
    ).filter((instrument) => instrument !== null);

    const instrumentsWithUserInstruments = userInstruments
      .map((userInstrument) => {
        const instrument = instruments.find(
          (instrument) =>
            instrument.toObject()._id.toString() ===
            userInstrument.toObject().instrumentId,
        );

        if (!instrument) {
          return null;
        }

        const { name } = instrument.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { createdAt, updatedAt, deactivatedAt, ...rest } =
          userInstrument.toObject();

        return { ...rest, name };
      })
      .filter((instrument) => instrument !== null);

    return {
      data: instrumentsWithUserInstruments,
      length: instrumentsWithUserInstruments.length,
    };
  }

  @UseGuards(AuthGuard)
  @Post("/")
  async createUserInstrument(
    @Req() req: RequestWithUser,
    @Body() reqBody: unknown,
  ) {
    const body = validate({
      schema: createUserInstrumentSchema,
      value: reqBody,
    });

    const instrument = await this.instrumentService.findOne(body.instrumentId);

    if (!instrument) {
      throw new BadRequestException();
    }

    return await this.userInstrumentService.createOne({
      ...body,
      userId: req.user.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Put("/:instrumentId")
  async updateUserInstrument(
    @Req() req: RequestWithUser,
    @Param("instrumentId") instrumentIdParam: string,
    @Body() reqBody: unknown,
  ) {
    const body = validate({
      schema: updateUserInstrumentSchema,
      value: reqBody,
    });
    const instrumentId = validate({
      schema: mongoIdSchema,
      value: instrumentIdParam,
    });

    const instrument = await this.instrumentService.findOne(instrumentId);

    if (!instrument) {
      throw new BadRequestException();
    }

    await this.userInstrumentService.updateOne({
      ...body,
      instrumentId,
      userId: req.user.sub,
    });

    return { message: "OK" };
  }

  @UseGuards(AuthGuard)
  @Delete("/:instrumentId")
  async deleteUserInstrument(
    @Req() req: RequestWithUser,
    @Param("instrumentId") instrumentIdParam: string,
  ) {
    const instrumentId = validate({
      schema: mongoIdSchema,
      value: instrumentIdParam,
    });

    const deletedUserInstrument = await this.userInstrumentService.deleteOne({
      instrumentId,
      userId: req.user.sub,
    });

    if (!deletedUserInstrument) {
      throw new NotFoundException("User instrument not found");
    }

    return { message: "OK" };
  }
}
