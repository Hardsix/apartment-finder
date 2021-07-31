import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { ApartmentFinderConfigService } from "./apartment-finder-config.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
  ],
  providers: [ApartmentFinderConfigService],
  exports: [ApartmentFinderConfigService],
})
export class ApartmentFinderConfigModule {}
