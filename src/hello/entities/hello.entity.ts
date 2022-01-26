import * as _ from "lodash";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Hello {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index("idx_flow_created")
  @CreateDateColumn()
  createdAt: Date;

  @Index("idx_flow_updated")
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column("json", { nullable: true })
  meta: unknown;
}
