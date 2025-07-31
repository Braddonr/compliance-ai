import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Framework } from './framework.entity';
import { ComplianceProgress } from './compliance-progress.entity';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column('simple-array', { nullable: true })
  requirements?: string[];

  @Column('text', { nullable: true })
  notes?: string;

  @ManyToOne(() => Framework, (framework) => framework.tasks)
  framework: Framework;

  @ManyToOne(() => ComplianceProgress, (progress) => progress.tasks)
  complianceProgress: ComplianceProgress;

  @ManyToOne(() => User, { nullable: true })
  assignedTo?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isOverdue(): boolean {
    if (!this.dueDate || this.status === TaskStatus.COMPLETED) return false;
    return new Date() > this.dueDate;
  }
}