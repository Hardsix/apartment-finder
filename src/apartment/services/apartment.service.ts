import * as _ from "lodash";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, FindManyOptions, Repository } from "typeorm";
import { Apartment } from "../entities/apartment.entity";

@Injectable()
export class ApartmentService {
  constructor(
    @InjectRepository(Apartment) private repository: Repository<Apartment>
  ) {}

  async create(apartment: Partial<Apartment>): Promise<Apartment> {
    return this.repository.save(apartment);
  }

  async update(id: string, apartment: Partial<Apartment>): Promise<Apartment> {
    await this.repository.update(id, apartment);
    return this.findOne(id);
  }

  async save(apartment: Apartment): Promise<Apartment> {
    return this.repository.save(apartment, {});
  }

  async saveWithSoftEqual(
    apartment: Partial<Apartment>
  ): Promise<{
    apartment: Apartment;
    isNewEntity: boolean;
  }> {
    const existingApartment = await this.findExistingApartment(apartment);
    if (existingApartment) {
      const versions: Partial<Apartment>[] =
        existingApartment?.meta?.versions || [];
      versions.push(existingApartment);

      const savedApartment = await this.update(existingApartment.id, apartment);
      return {
        apartment: savedApartment,
        isNewEntity: false,
      };
    }

    const newApartment = await this.create(apartment);
    return {
      apartment: newApartment,
      isNewEntity: true,
    };
  }

  async findOne(id: string): Promise<Apartment> {
    return this.repository.findOne(id);
  }

  async getAll(): Promise<Apartment[]> {
    return this.repository.find();
  }

  async find(options: FindManyOptions<Apartment>): Promise<Apartment[]> {
    return this.repository.find(options);
  }

  async delete(apartment: Apartment): Promise<DeleteResult> {
    return this.repository.delete(apartment);
  }

  private async findExistingApartment(
    apartment: Partial<Apartment>
  ): Promise<Apartment> {
    if (apartment.advertisementCode) {
      const sameCodeApts = await this.find({
        where: { advertisementCode: apartment.advertisementCode },
      });
      if (_.size(sameCodeApts) > 0) {
        return sameCodeApts[0];
      }
    }

    if (apartment.url) {
      const sameUrlApts = await this.find({ where: { url: apartment.url } });
      if (_.size(sameUrlApts) > 0) {
        return sameUrlApts[0];
      }
    }

    return null;
  }
}
