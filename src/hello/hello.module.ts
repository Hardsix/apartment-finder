import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HelloController } from "./controllers";
import { Hello } from "./entities/hello.entity";
import { HelloService } from "./services/hello.service";

@Module({
  imports: [TypeOrmModule.forFeature([Hello])],
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
