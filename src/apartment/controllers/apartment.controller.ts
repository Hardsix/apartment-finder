import * as _ from "lodash";
import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
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

  @Get("/")
  async getAll(@Query() query: Record<string, any>): Promise<Apartment[]> {
    const options = {
      skip: 0,
      take: 50,
      ...query,
    }

    const pageSize = Number.parseInt(query.pageSize)
    const pageNumber = Number.parseInt(query.pageNumber)
    if (Number.isInteger(pageSize) || Number.isInteger(pageNumber)) {
      const skip = Number.isInteger(pageNumber) && Number.isInteger(pageSize) ? query.pageNumber * query.pageSize : undefined
      const take = Number.isInteger(pageSize) ? pageSize : undefined

      if (skip !== undefined) {
        options.skip = skip
      }
      if (take !== undefined) {
        options.take = take
      }
    }

    const apartments = await this.apartmentService.find(options);

    return apartments;
  }

  @Post("")
  async create(@Body() apartmentBody: Partial<Apartment>) {
    const apartment = await this.apartmentService.saveWithSoftEqual(
      apartmentBody
    );
    return apartment;
  }
}
