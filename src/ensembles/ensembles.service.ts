import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Ensemble, type EnsembleDocument } from "./ensembles.schema";

@Injectable()
export class EnsemblesService {
  constructor(
    @InjectModel(Ensemble.name) private ensembleModel: Model<Ensemble>,
  ) {}

  async findAll({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }): Promise<EnsembleDocument[]> {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    return this.ensembleModel.find().skip(skip).limit(limit).exec();
  }

  async findById(id: string): Promise<EnsembleDocument | null> {
    return this.ensembleModel
      .findOne({
        _id: id,
        deactivated_at: { $exists: false },
      })
      .exec();
  }

  async insertMany(ensembles: Ensemble[]): Promise<EnsembleDocument[]> {
    return this.ensembleModel.insertMany(ensembles);
  }

  async insertOne(ensemble: Ensemble): Promise<EnsembleDocument> {
    return await this.ensembleModel.create(ensemble);
  }

  async deleteAll(): Promise<void> {
    await this.ensembleModel.deleteMany();
  }

  async softDeleteOne(id: string): Promise<EnsembleDocument | null> {
    return this.ensembleModel
      .findByIdAndUpdate(
        id,
        { deactivated_at: new Date().toISOString() },
        { new: true },
      )
      .exec();
  }
}
