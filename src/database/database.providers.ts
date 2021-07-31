import { createConnection } from "typeorm";
import { ApartmentFinderConfigService } from "~/apartment-finder-config";

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (configService: ApartmentFinderConfigService) => {
      const config = configService.postgresConnectionConfig;
      return await createConnection(config);
    },
    inject: [ApartmentFinderConfigService],
  },
];
