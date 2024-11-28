import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserEnsembleDocument = HydratedDocument<UserEnsemble>;

@Schema()
export class UserEnsemble {
  @Prop({ index: true })
  user_id: string;

  @Prop({ index: true })
  ensemble_id: string;

  @Prop()
  created_at: string;
}

export const UserEnsembleSchema = SchemaFactory.createForClass(UserEnsemble);
