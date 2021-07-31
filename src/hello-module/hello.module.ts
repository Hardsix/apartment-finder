import { Module } from "@nestjs/common";
import { HelloController } from "./controllers";

@Module({
  controllers: [HelloController],
})
export class HelloModule {}
