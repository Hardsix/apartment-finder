import * as _ from 'lodash'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class ScraperJob {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('idx_scraperJob_created')
  @CreateDateColumn()
  createdAt: Date

  @Index('idx_scraperJob_updated')
  @UpdateDateColumn()
  updatedAt: Date

  @Column()
  url: string

  @Column()
  type: 'njuskalo' | 'index'
}
