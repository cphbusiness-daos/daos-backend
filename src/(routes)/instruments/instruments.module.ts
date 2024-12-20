import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { InstrumentsController } from "./instruments.controller";
import { Instrument, InstrumentSchema } from "./instruments.schema";
import { InstrumentsService } from "./instruments.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instrument.name, schema: InstrumentSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
