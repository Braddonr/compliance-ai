import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Framework } from './framework.entity';
import { Organization } from '../../users/entities/organization.entity';
import { Task } from './task.entity';

@Entity('compliance_progress')
export class ComplianceProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Framework, (framework) => framework.progress)
  framework: Framework;

  @ManyToOne(() => Organization, (organization) => organization.complianceProgress)
  organization: Organization;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ default: 0 })
  totalTasks: number;

  @Column({ default: 0 })
  completedTasks: number;

  @Column({ default: 0 })
  inProgressTasks: number;

  @Column({ default: 0 })
  pendingTasks: number;

  @OneToMany(() => Task, (task) => task.complianceProgress)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate progress percentage based on completed tasks
  calculateProgress(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100 * 100) / 100;
  }
}