import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  fullName: string;

  @Prop({ index: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  acceptedTocAt: string;

  @Prop()
  newsletterOptInAt?: string;

  @Prop()
  address?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  bio?: string;

  @Prop()
  birthDate?: string;

  @Prop()
  created_at: string;

  @Prop()
  updated_at?: string;

  @Prop({ index: true })
  deactivated_at?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
