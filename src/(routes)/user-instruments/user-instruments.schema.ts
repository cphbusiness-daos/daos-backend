import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserInstrumentDocument = HydratedDocument<UserInstrument>;

@Schema()
export class UserInstrument {
  @Prop()
  userId: string;

  @Prop()
  instrumentId: string;

  @Prop()
  experience: string;

  @Prop()
  description: string;

  @Prop()
  genre: Array<
    | "baroque"
    | "folk"
    | "chamber"
    | "romantic"
    | "late-modern"
    | "late-romantic"
    | "symphonic"
  >;

  @Prop()
  deactivatedAt?: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const UserInstrumentSchema =
  SchemaFactory.createForClass(UserInstrument);
