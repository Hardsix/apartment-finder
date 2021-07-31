import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ApartmentFinderConfigModule } from "./apartment-finder-config/apartment-finder-config.module";
import { HealthModule } from "./health/health.module";
import { HelloModule } from "./hello-module/hello.module";

@Module({
  imports: [
    ApartmentFinderConfigModule,
    DatabaseModule,
    HealthModule,
    HelloModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
