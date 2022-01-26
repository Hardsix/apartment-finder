import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Hello } from "../entities/hello.entity";
import { HelloService } from "../services/hello.service";

@Controller("hello")
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get("/:helloId")
  async get(@Param("helloId") helloId: string): Promise<Hello> {
    const hello = await this.helloService.findOne(helloId);
    return hello;
  }

  @Post("")
  async create(@Body() helloBody: Partial<Hello>) {
    const hello = await this.helloService.create(helloBody);
    return hello;
  }
}
