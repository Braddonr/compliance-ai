import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ComplianceProgress } from './compliance-progress.entity';
import { Task } from './task.entity';

export enum FrameworkType {
  PCI_DSS = 'PCI-DSS',
  SOC2 = 'SOC2',
  GDPR = 'GDPR',
  ISO27001 = 'ISO27001',
  HIPAA = 'HIPAA',
}

@Entity('frameworks')
export class Framework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FrameworkType,
    unique: true,
  })
  name: FrameworkType;

  @Column()
  displayName: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  requirements?: string;

  @Column('simple-array', { nullable: true })
  categories?: string[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ComplianceProgress, (progress) => progress.framework)
  progress: ComplianceProgress[];

  @OneToMany(() => Task, (task) => task.framework)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}