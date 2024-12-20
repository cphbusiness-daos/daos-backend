import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Instrument, InstrumentDocument } from "./instruments.schema";

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectModel(Instrument.name) private instrumentModel: Model<Instrument>,
  ) {}

  async findAll(): Promise<InstrumentDocument[]> {
    return this.instrumentModel.find().exec();
  }

  async count(): Promise<number> {
    return this.instrumentModel.countDocuments();
  }

  async findOne(id: string): Promise<InstrumentDocument | null> {
    return this.instrumentModel.findById(id).exec();
  }
}
