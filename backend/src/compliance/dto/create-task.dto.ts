import { IsString, IsEnum, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Network Security Controls' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Implement firewall rules and network segmentation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.PENDING })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ example: '2024-08-15T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: ['Requirement 1.1', 'Requirement 1.2'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @ApiProperty({ example: 'Additional notes about the task', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'uuid-framework-id' })
  @IsUUID()
  frameworkId: string;

  @ApiProperty({ example: 'uuid-compliance-progress-id' })
  @IsUUID()
  complianceProgressId: string;

  @ApiProperty({ example: 'uuid-user-id', required: false })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}