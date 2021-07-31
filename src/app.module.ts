import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ApartmentFinderConfigModule } from "./apartment-finder-config/apartment-finder-config.module";
import { HealthModule } from "./health/health.module";
import { HelloModule } from "./hello/hello.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApartmentFinderConfigService } from "./apartment-finder-config";

@Module({
  imports: [
    ApartmentFinderConfigModule,
    DatabaseModule,
    HealthModule,
    HelloModule,
    TypeOrmModule.forRootAsync({
      imports: [ApartmentFinderConfigModule],
      useFactory: (config: ApartmentFinderConfigService) => config.postgresConnectionConfig,
      inject: [ApartmentFinderConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
