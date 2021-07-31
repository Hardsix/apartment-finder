import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConnectionOptions } from "typeorm";

@Injectable()
export class ApartmentFinderConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>("PORT");
  }

  get postgresConnectionConfig(): ConnectionOptions {
    const host = this.configService.get<string>("POSTGRES_HOST");
    const username = this.configService.get<string>("POSTGRES_USER");
    const password = this.configService.get<string>("POSTGRES_PASSWORD");
    const database = this.configService.get<string>("POSTGRES_DB_NAME");
    const port = this.configService.get<number>("POSTGRES_PORT");

    const migrationsRun =
      this.configService.get<string>("MIGRATIONS_RUN") === "true";

    const connectionConfig: ConnectionOptions = {
      type: "postgres",
      username,
      password,
      database,
      host,
      port,
      entities: [__dirname + "/../**/*.entity{.ts,.js}"],
      migrationsRun,
      migrations: [__dirname + "/../**/migrations/*{.ts,.js}"],
      logging: ["error", "schema"],
    };

    return connectionConfig;
  }
}
