import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type InstrumentDocument = HydratedDocument<Instrument>;

@Schema()
export class Instrument {
  @Prop()
  name: string;
}

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);
