import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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

  async deleteMany(): Promise<void> {
    await this.userModel.deleteMany().exec();
  }
}
