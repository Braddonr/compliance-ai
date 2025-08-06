import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Framework, FrameworkType } from './entities/framework.entity';
import { ComplianceProgress } from './entities/compliance-progress.entity';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(Framework)
    private frameworksRepository: Repository<Framework>,
    @InjectRepository(ComplianceProgress)
    private progressRepository: Repository<ComplianceProgress>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getFrameworks(): Promise<Framework[]> {
    return this.frameworksRepository.find({ where: { isActive: true } });
  }

  async getProgress(organizationId: string): Promise<ComplianceProgress[]> {
    const progress = await this.progressRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['framework', 'tasks', 'tasks.assignedTo'],
    });

    // Calculate progress for each framework
    for (const p of progress) {
      p.progressPercentage = p.calculateProgress();
    }

    return progress;
  }

  async getProgressByFramework(organizationId: string, frameworkId: string): Promise<ComplianceProgress> {
    const progress = await this.progressRepository.findOne({
      where: { 
        organization: { id: organizationId },
        framework: { id: frameworkId }
      },
      relations: ['framework', 'tasks', 'tasks.assignedTo'],
    });

    if (!progress) {
      throw new NotFoundException('Compliance progress not found');
    }

    progress.progressPercentage = progress.calculateProgress();
    return progress;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      framework: { id: createTaskDto.frameworkId },
      complianceProgress: { id: createTaskDto.complianceProgressId },
      assignedTo: createTaskDto.assignedToId ? { id: createTaskDto.assignedToId } : undefined,
    });
    
    const savedTask = await this.tasksRepository.save(task);

    // Update compliance progress counts
    await this.updateProgressCounts(createTaskDto.complianceProgressId);

    return savedTask;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['complianceProgress'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const oldStatus = task.status;
    Object.assign(task, updateTaskDto);

    if (updateTaskDto.status === TaskStatus.COMPLETED && oldStatus !== TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    const updatedTask = await this.tasksRepository.save(task);

    // Update compliance progress if status changed
    if (oldStatus !== updateTaskDto.status) {
      await this.updateProgressCounts(task.complianceProgress.id);
    }

    return updatedTask;
  }

  async getTasks(complianceProgressId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { complianceProgress: { id: complianceProgressId } },
      relations: ['assignedTo', 'framework'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPriorityTasks(organizationId: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.framework', 'framework')
      .leftJoinAndSelect('task.complianceProgress', 'progress')
      .leftJoinAndSelect('progress.organization', 'organization')
      .where('organization.id = :organizationId', { organizationId })
      .andWhere('task.priority IN (:...priorities)', { priorities: [TaskPriority.HIGH, TaskPriority.CRITICAL] })
      .andWhere('task.status != :status', { status: TaskStatus.COMPLETED })
      .orderBy('task.dueDate', 'ASC')
      .limit(10)
      .getMany();
  }

  private async updateProgressCounts(complianceProgressId: string): Promise<void> {
    const progress = await this.progressRepository.findOne({
      where: { id: complianceProgressId },
      relations: ['tasks'],
    });

    if (!progress) return;

    const tasks = progress.tasks;
    progress.totalTasks = tasks.length;
    progress.completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    progress.inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    progress.pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    progress.progressPercentage = progress.calculateProgress();

    await this.progressRepository.save(progress);
  }

  async initializeFrameworks(): Promise<void> {
    const frameworks = [
      {
        name: FrameworkType.PCI_DSS,
        displayName: 'PCI-DSS',
        description: 'Payment Card Industry Data Security Standard',
        requirements: 'Secure payment processing and cardholder data protection',
        categories: ['Network Security', 'Access Control', 'Data Protection', 'Monitoring'],
      },
      {
        name: FrameworkType.SOC2,
        displayName: 'SOC2',
        description: 'System and Organization Controls 2',
        requirements: 'Security, availability, processing integrity, confidentiality, and privacy',
        categories: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
      },
      {
        name: FrameworkType.GDPR,
        displayName: 'GDPR',
        description: 'General Data Protection Regulation',
        requirements: 'EU data privacy and protection requirements',
        categories: ['Data Processing', 'Consent Management', 'Data Subject Rights', 'Privacy by Design'],
      },
      {
        name: FrameworkType.ISO27001,
        displayName: 'ISO 27001',
        description: 'Information Security Management System',
        requirements: 'International standard for information security management',
        categories: ['Risk Management', 'Security Controls', 'Incident Management', 'Business Continuity'],
      },
    ];

    for (const frameworkData of frameworks) {
      const existing = await this.frameworksRepository.findOne({
        where: { name: frameworkData.name },
      });

      if (!existing) {
        const framework = this.frameworksRepository.create(frameworkData);
        await this.frameworksRepository.save(framework);
      }
    }
  }
}