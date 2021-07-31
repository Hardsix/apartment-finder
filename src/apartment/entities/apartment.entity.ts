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
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Index('idx_apartment_url', { unique: true })
  @Column({ nullable: false })
  url: string

  @Column({ nullable: false })
  squareMeters: number

  @Column({ nullable: false })
  priceEuros: number

  @Column({ nullable: true })
  bedroomCount: number

  @Column({ nullable: true })
  hasParking: boolean

  @Column({ nullable: true })
  hasGarage: boolean

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  neighbourhood: string

  @Column({ nullable: true })
  locationInNeighbourhood: string

  @Index('idx_apartment_advertisementCode', { unique: true })
  @Column()
  advertisementCode: string

  @Column()
  floor: number

  @Column('json', { nullable: true })
  meta: any

  @Index('idx_apartment_created')
  @CreateDateColumn()
  createdAt: Date

  @Index('idx_apartment_updated')
  @UpdateDateColumn()
  updatedAt: Date
}
