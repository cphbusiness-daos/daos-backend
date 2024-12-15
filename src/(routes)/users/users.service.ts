import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email,
        deactivated_at: { $exists: false },
      })
      .exec();
  }

  async createOne(user: User): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  async updateOne(
    id: string,
    user: Partial<User> & { newsLetterOptOut?: boolean },
  ): Promise<UserDocument | null> {
    const timestamp = new Date().toISOString();
    const { newsLetterOptOut, ...rest } = user;

    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...rest,
          $unset: newsLetterOptOut ? { newsletterOptInAt: "" } : {},
          newsletterOptInAt: user.newsletterOptInAt ? timestamp : undefined,
          updated_at: timestamp,
        },
        { new: true },
      )
      .exec();
  }

  async deleteOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async deleteMany(): Promise<void> {
    await this.userModel.deleteMany().exec();
  }
}
