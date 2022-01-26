import * as _ from "lodash";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ScraperJobType } from "../types";

@Entity()
export class ScraperJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Index("idx_scraperJob_created")
  @CreateDateColumn()
  createdAt: Date;

  @Index("idx_scraperJob_updated")
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastProcessed: Date;

  @Column()
  url: string;

  @Column()
  type: ScraperJobType;

  @Column()
  priority: number;
}
