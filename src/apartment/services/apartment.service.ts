import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, FindManyOptions, Repository } from 'typeorm'
import { Apartment } from '../entities/apartment.entity'

@Injectable()
export class ApartmentService {
  constructor(
    @InjectRepository(Apartment) private repository: Repository<Apartment>,
  ) {}

  async create(apartment: Partial<Apartment>): Promise<Apartment> {
    return this.repository.save(apartment)
  }

  async update(id: string, apartment: Partial<Apartment>): Promise<Apartment> {
    await this.repository.update(id, apartment)
    return this.findOne(id)
  }

  async save(apartment: Apartment): Promise<Apartment> {
    return this.repository.save(apartment, {  })
  }

  async findOne(id: string): Promise<Apartment> {
    return this.repository.findOne(id)
  }

  async getAll(): Promise<Apartment[]> {
    return this.repository.find()
  }

  async find(options: FindManyOptions<Apartment>): Promise<Apartment[]> {
    return this.repository.find(options)
  }

  async delete(apartment: Apartment): Promise<DeleteResult> {
    return this.repository.delete(apartment)
  }
}
