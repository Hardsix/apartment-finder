import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, FindManyOptions, Repository } from 'typeorm'
import { Hello } from '../entities/hello.entity'

@Injectable()
export class HelloService {
  constructor(
    @InjectRepository(Hello) private repository: Repository<Hello>,
  ) {}

  async create(hello: Partial<Hello>): Promise<Hello> {
    return this.repository.save(hello)
  }

  async update(id: string, hello: Partial<Hello>): Promise<Hello> {
    await this.repository.update(id, hello)
    return this.findOne(id)
  }

  async save(hello: Hello): Promise<Hello> {
    return this.repository.save(hello)
  }

  async findOne(id: string): Promise<Hello> {
    return this.repository.findOne(id)
  }

  async getAll(): Promise<Hello[]> {
    return this.repository.find()
  }

  async find(options: FindManyOptions<Hello>): Promise<Hello[]> {
    return this.repository.find(options)
  }

  async delete(hello: Hello): Promise<DeleteResult> {
    return this.repository.delete(hello)
  }
}
