import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import _ from "lodash";
import { Apartment } from "../entities/apartment.entity";
import { ApartmentService } from "../services/apartment.service";

@Controller("apartment")
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get("/:apartmentId")
  async get(@Param("apartmentId") apartmentId: string): Promise<Apartment> {
    const apartment = await this.apartmentService.findOne(apartmentId);
    return apartment;
  }

  @Post("")
  async create(@Body() apartmentBody: Partial<Apartment>) {
    const apartment = await this.apartmentService.saveWithSoftEqual(
      apartmentBody
    );
    return apartment;
  }
}
