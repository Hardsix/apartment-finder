require("dotenv").config();

module.exports = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  cli: {
    migrationsDir: "src/migrations",
  },
};
