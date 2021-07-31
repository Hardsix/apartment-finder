import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import _ from "lodash";
import { Apartment } from "../entities/apartment.entity";
import { ApartmentService } from "../services/apartment.service";

@Controller("apartment")
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}
  
  async findExistingApartment(apartment: Partial<Apartment>): Promise<Apartment> {
    if (apartment.advertisementCode) {
      const sameCodeApts = await this.apartmentService.find({ where: { advertisementCode: apartment.advertisementCode } })
      if (_.size(sameCodeApts) > 0) {
        return sameCodeApts[0]
      }
    }

    if (apartment.url) {
      const sameUrlApts = await this.apartmentService.find({ where: { url: apartment.url } })
      if (_.size(sameUrlApts) > 0) {
        return sameUrlApts[0]
      }
    }

    return null
  }

  @Get('/:apartmentId')
  async get(@Param('apartmentId') apartmentId: string): Promise<Apartment> {
    const apartment = await this.apartmentService.findOne(apartmentId)
    return apartment
  }

  @Post('')
  async create(@Body() apartmentBody: Partial<Apartment>) {
    const existingApartment = await this.findExistingApartment(apartmentBody)
    if (existingApartment) {
      const versions: Partial<Apartment>[] = existingApartment?.meta?.versions || []
      versions.push(existingApartment)

      const savedApartment = await this.apartmentService.update(existingApartment.id, apartmentBody)
      return savedApartment
    }

    const apartment = await this.apartmentService.create(apartmentBody)
    return apartment
  }
}
