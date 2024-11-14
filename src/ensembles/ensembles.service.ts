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
  }): Promise<Ensemble[]> {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    return this.ensembleModel.find().skip(skip).limit(limit).exec();
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

  async findById(id: string): Promise<Ensemble | null> {
    return this.ensembleModel.findById(id).exec();
  }
}
