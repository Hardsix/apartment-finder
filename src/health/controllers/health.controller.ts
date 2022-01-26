import { Controller, Get } from "@nestjs/common";

@Controller("_health/readiness")
export class HealthController {
  @Get()
  check() {
    return "OK!";
  }
}
