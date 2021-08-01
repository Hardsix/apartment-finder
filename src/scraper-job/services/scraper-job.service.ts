import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, FindManyOptions, Repository } from 'typeorm'
import { ScraperJob } from '../entities/scraper-job.entity'

@Injectable()
export class ScraperJobService {
  constructor(
    @InjectRepository(ScraperJob) private repository: Repository<ScraperJob>,
  ) {}

  async create(scraperJob: Partial<ScraperJob>): Promise<ScraperJob> {
    return this.repository.save(scraperJob)
  }

  async update(id: string, scraperJob: Partial<ScraperJob>): Promise<ScraperJob> {
    await this.repository.update(id, scraperJob)
    return this.findOne(id)
  }

  async save(scraperJob: ScraperJob): Promise<ScraperJob> {
    return this.repository.save(scraperJob)
  }

  async findOne(id: string): Promise<ScraperJob> {
    return this.repository.findOne(id)
  }

  async getAll(): Promise<ScraperJob[]> {
    return this.repository.find()
  }

  async find(options: FindManyOptions<ScraperJob>): Promise<ScraperJob[]> {
    return this.repository.find(options)
  }

  async delete(scraperJob: ScraperJob): Promise<DeleteResult> {
    return this.repository.delete(scraperJob?.id)
  }
}
