import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApartmentFinderConfigService } from "./apartment-finder-config/apartment-finder-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apartmentFinderConfig = app.get(ApartmentFinderConfigService);

  await app.listen(apartmentFinderConfig.port);
}

bootstrap();
