import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  UserInstrument,
  UserInstrumentDocument,
} from "./user-instruments.schema";

@Injectable()
export class UserInstrumentsService {
  constructor(
    @InjectModel(UserInstrument.name)
    private instrumentModel: Model<UserInstrument>,
  ) {}

  async findByUserId({
    userId,
  }: {
    userId: string;
  }): Promise<UserInstrumentDocument[]> {
    return this.instrumentModel
      .find({ userId, deactivatedAt: { $exists: false } })
      .exec();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.instrumentModel
      .countDocuments({ userId, deactivatedAt: { $exists: false } })
      .exec();
  }

  async createOne(
    data: Omit<UserInstrument, "createdAt" | "updatedAt">,
  ): Promise<UserInstrumentDocument> {
    const timestamp = new Date().toISOString();
    return this.instrumentModel.create({
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  async updateOne({
    instrumentId,
    userId,
    ...data
  }: Partial<Pick<UserInstrument, "description" | "experience">> &
    Pick<UserInstrument, "userId" | "instrumentId">) {
    const timestamp = new Date().toISOString();
    return this.instrumentModel
      .updateOne(
        { userId, instrumentId, deactivatedAt: { $exists: false } },
        { ...data, updatedAt: timestamp },
        { new: true },
      )
      .exec();
  }

  async deleteOne({
    userId,
    instrumentId,
  }: Pick<
    UserInstrument,
    "userId" | "instrumentId"
  >): Promise<UserInstrumentDocument | null> {
    return await this.instrumentModel
      .findOneAndUpdate(
        { userId, instrumentId },
        { deactivatedAt: new Date().toISOString() },
      )
      .exec();
  }
}
