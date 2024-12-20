import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { InstrumentsModule } from "../instruments/instruments.module";
import { UsersModule } from "../users/users.module";
import { UserInstrumentsController } from "./user-instruments.controller";
import {
  UserInstrument,
  UserInstrumentSchema,
} from "./user-instruments.schema";
import { UserInstrumentsService } from "./user-instruments.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInstrument.name, schema: UserInstrumentSchema },
    ]),
    AuthModule,
    UsersModule,
    InstrumentsModule,
  ],
  controllers: [UserInstrumentsController],
  providers: [UserInstrumentsService],
})
export class UserInstrumentsModule {}
