import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { UserEnsemble, UserEnsembleDocument } from "./user-ensembles.schema";

@Injectable()
export class UserEnsemblesService {
  constructor(
    @InjectModel(UserEnsemble.name)
    private userEnsembleModel: Model<UserEnsemble>,
  ) {}

  async findOne({
    userId,
    ensembleId,
  }: {
    userId: string;
    ensembleId: string;
  }): Promise<UserEnsembleDocument | null> {
    return this.userEnsembleModel
      .findOne({
        user_id: userId,
        ensemble_id: ensembleId,
      })
      .exec();
  }

  async findByUserId({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<UserEnsembleDocument[] | null> {
    return this.userEnsembleModel
      .find({
        user_id: userId,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.userEnsembleModel.countDocuments({
      user_id: userId,
    });
  }

  async findByEnsembleId(
    ensembleId: string,
  ): Promise<UserEnsembleDocument[] | null> {
    return this.userEnsembleModel
      .find({
        ensemble_id: ensembleId,
      })
      .exec();
  }

  async createOne({
    ensembleId,
    userId,
  }: {
    userId: string;
    ensembleId: string;
  }): Promise<UserEnsembleDocument> {
    const timestamp = new Date().toISOString();
    return this.userEnsembleModel.create({
      user_id: userId,
      ensemble_id: ensembleId,
      created_at: timestamp,
    });
  }

  async deleteMany(): Promise<void> {
    await this.userEnsembleModel.deleteMany().exec();
  }
}
