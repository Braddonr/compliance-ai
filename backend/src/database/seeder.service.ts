import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../users/entities/organization.entity';
import { Framework, FrameworkType } from '../compliance/entities/framework.entity';
import { ComplianceProgress } from '../compliance/entities/compliance-progress.entity';
import { Task, TaskStatus, TaskPriority } from '../compliance/entities/task.entity';
import { Document, DocumentStatus } from '../documents/entities/document.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(Framework)
    private frameworksRepository: Repository<Framework>,
    @InjectRepository(ComplianceProgress)
    private progressRepository: Repository<ComplianceProgress>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Create organization
    const organization = await this.createOrganization();
    
    // Create frameworks
    const frameworks = await this.createFrameworks();
    
    // Create users
    const users = await this.createUsers(organization);
    
    // Create compliance progress
    const progressRecords = await this.createComplianceProgress(organization, frameworks);
    
    // Create tasks
    await this.createTasks(frameworks, progressRecords, users);
    
    // Create documents
    await this.createDocuments(organization, frameworks, users);

    console.log('✅ Database seeding completed!');
  }

  private async createOrganization(): Promise<Organization> {
    const existing = await this.organizationsRepository.findOne({
      where: { name: 'Demo Fintech Company' },
    });

    if (existing) return existing;

    const organization = this.organizationsRepository.create({
      name: 'Demo Fintech Company',
      description: 'A sample fintech company for compliance demonstration',
      website: 'https://demo-fintech.com',
      industry: 'Financial Technology',
    });

    return this.organizationsRepository.save(organization);
  }

  private async createFrameworks(): Promise<Framework[]> {
    const frameworksData = [
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

    const frameworks: Framework[] = [];
    for (const frameworkData of frameworksData) {
      let framework = await this.frameworksRepository.findOne({
        where: { name: frameworkData.name },
      });

      if (!framework) {
        framework = this.frameworksRepository.create(frameworkData);
        framework = await this.frameworksRepository.save(framework);
      }
      frameworks.push(framework);
    }

    return frameworks;
  }

  private async createUsers(organization: Organization): Promise<User[]> {
    const usersData = [
      {
        email: 'admin@demo-fintech.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: UserRole.ADMIN,
        password: 'password123',
      },
      {
        email: 'compliance@demo-fintech.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: UserRole.COMPLIANCE_OFFICER,
        password: 'password123',
      },
      {
        email: 'sam@demo-fintech.com',
        firstName: 'Sam',
        lastName: 'Taylor',
        role: UserRole.TEAM_MEMBER,
        password: 'password123',
      },
      {
        email: 'jamie@demo-fintech.com',
        firstName: 'Jamie',
        lastName: 'Smith',
        role: UserRole.TEAM_MEMBER,
        password: 'password123',
      },
    ];

    const users: User[] = [];
    for (const userData of usersData) {
      let user = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = this.usersRepository.create({
          ...userData,
          password: hashedPassword,
          organization,
        });
        user = await this.usersRepository.save(user);
      }
      users.push(user);
    }

    return users;
  }

  private async createComplianceProgress(
    organization: Organization,
    frameworks: Framework[],
  ): Promise<ComplianceProgress[]> {
    const progressRecords: ComplianceProgress[] = [];

    for (const framework of frameworks) {
      let progress = await this.progressRepository.findOne({
        where: { 
          organization: { id: organization.id },
          framework: { id: framework.id },
        },
      });

      if (!progress) {
        progress = this.progressRepository.create({
          framework,
          organization,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          progressPercentage: 0,
        });
        progress = await this.progressRepository.save(progress);
      }
      progressRecords.push(progress);
    }

    return progressRecords;
  }

  private async createTasks(
    frameworks: Framework[],
    progressRecords: ComplianceProgress[],
    users: User[],
  ): Promise<void> {
    const tasksData = [
      // PCI-DSS Tasks
      {
        name: 'Network Security Controls',
        description: 'Implement firewall rules and network segmentation',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-08-15'),
        frameworkName: FrameworkType.PCI_DSS,
        requirements: ['Requirement 1.1', 'Requirement 1.2'],
      },
      {
        name: 'Access Control Measures',
        description: 'Implement user access controls and authentication',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-08-20'),
        frameworkName: FrameworkType.PCI_DSS,
        requirements: ['Requirement 7.1', 'Requirement 8.1'],
      },
      // SOC2 Tasks
      {
        name: 'Risk Assessment Documentation',
        description: 'Complete comprehensive risk assessment documentation',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-08-10'),
        frameworkName: FrameworkType.SOC2,
        requirements: ['CC3.1', 'CC3.2'],
      },
      {
        name: 'Vendor Management Process',
        description: 'Establish vendor management and due diligence processes',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-08-18'),
        frameworkName: FrameworkType.SOC2,
        requirements: ['CC9.1', 'CC9.2'],
      },
      // GDPR Tasks
      {
        name: 'Data Processing Agreement',
        description: 'Create and implement data processing agreements',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.COMPLETED,
        dueDate: new Date('2024-07-25'),
        frameworkName: FrameworkType.GDPR,
        requirements: ['Article 28', 'Article 32'],
        completedAt: new Date('2024-07-20'),
      },
    ];

    for (const taskData of tasksData) {
      const framework = frameworks.find(f => f.name === taskData.frameworkName);
      const progress = progressRecords.find(p => p.framework.id === framework?.id);
      const assignedUser = users[Math.floor(Math.random() * users.length)];

      if (framework && progress) {
        const existingTask = await this.tasksRepository.findOne({
          where: { name: taskData.name, framework: { id: framework.id } },
        });

        if (!existingTask) {
          const task = this.tasksRepository.create({
            ...taskData,
            framework,
            complianceProgress: progress,
            assignedTo: assignedUser,
          });
          await this.tasksRepository.save(task);
        }
      }
    }

    // Update progress counts
    for (const progress of progressRecords) {
      const tasks = await this.tasksRepository.find({
        where: { complianceProgress: { id: progress.id } },
      });

      progress.totalTasks = tasks.length;
      progress.completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      progress.inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      progress.pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
      progress.progressPercentage = progress.calculateProgress();

      await this.progressRepository.save(progress);
    }
  }

  private async createDocuments(
    organization: Organization,
    frameworks: Framework[],
    users: User[],
  ): Promise<void> {
    const documentsData = [
      {
        title: 'PCI-DSS Compliance Documentation',
        description: 'Payment Card Industry Data Security Standard documentation for secure payment processing.',
        content: '# PCI-DSS Compliance Documentation\n\nThis document outlines our compliance with PCI-DSS requirements...',
        status: DocumentStatus.IN_REVIEW,
        progress: 75,
        frameworkName: FrameworkType.PCI_DSS,
      },
      {
        title: 'SOC2 Type II Audit Preparation',
        description: 'System and Organization Controls documentation for security, availability, and confidentiality.',
        content: '# SOC2 Type II Audit Preparation\n\nThis document contains our SOC2 compliance preparation...',
        status: DocumentStatus.DRAFT,
        progress: 45,
        frameworkName: FrameworkType.SOC2,
      },
      {
        title: 'GDPR Privacy Policy',
        description: 'General Data Protection Regulation compliance documentation for EU data privacy requirements.',
        content: '# GDPR Privacy Policy\n\nThis privacy policy describes how we collect, use, and protect personal data...',
        status: DocumentStatus.PUBLISHED,
        progress: 90,
        frameworkName: FrameworkType.GDPR,
      },
      {
        title: 'ISO27001 Information Security',
        description: 'International standard for information security management systems and risk assessment.',
        content: '# ISO27001 Information Security Management\n\nThis document outlines our information security management system...',
        status: DocumentStatus.DRAFT,
        progress: 20,
        frameworkName: FrameworkType.ISO27001,
      },
    ];

    for (const docData of documentsData) {
      const framework = frameworks.find(f => f.name === docData.frameworkName);
      const createdBy = users[0]; // Admin user
      const collaborators = users.slice(1, 3); // Some team members

      if (framework) {
        const existingDoc = await this.documentsRepository.findOne({
          where: { title: docData.title, organization: { id: organization.id } },
        });

        if (!existingDoc) {
          const document = this.documentsRepository.create({
            ...docData,
            framework,
            organization,
            createdBy,
            collaborators,
          });
          await this.documentsRepository.save(document);
        }
      }
    }
  }
}