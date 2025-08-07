import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../users/entities/organization.entity';
import { Framework, FrameworkType } from '../compliance/entities/framework.entity';
import { ComplianceProgress } from '../compliance/entities/compliance-progress.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StepByStepSeederService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(Framework)
    private frameworksRepository: Repository<Framework>,
    @InjectRepository(ComplianceProgress)
    private progressRepository: Repository<ComplianceProgress>,
  ) {}

  async testStep1Organization(): Promise<any> {
    try {
      console.log('🧪 Testing Step 1: Organization creation...');
      
      let organization = await this.organizationsRepository.findOne({
        where: { name: 'Demo Fintech Company' },
      });

      if (!organization) {
        organization = this.organizationsRepository.create({
          name: 'Demo Fintech Company',
          description: 'A sample fintech company for compliance demonstration',
          website: 'https://demo-fintech.com',
          industry: 'Financial Technology',
        });
        organization = await this.organizationsRepository.save(organization);
      }

      return {
        success: true,
        step: 'Organization',
        data: {
          id: organization.id,
          name: organization.name,
          hasId: !!organization.id,
        }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Organization',
        error: error.message,
        stack: error.stack,
      };
    }
  }

  async testStep2Frameworks(): Promise<any> {
    try {
      console.log('🧪 Testing Step 2: Framework creation...');
      
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
      ];

      const frameworks = [];
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

      return {
        success: true,
        step: 'Frameworks',
        data: {
          count: frameworks.length,
          frameworks: frameworks.map(f => ({
            id: f.id,
            name: f.name,
            hasId: !!f.id,
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Frameworks',
        error: error.message,
        stack: error.stack,
      };
    }
  }

  async testStep3Users(): Promise<any> {
    try {
      console.log('🧪 Testing Step 3: User creation...');
      
      // Get organization first
      const organization = await this.organizationsRepository.findOne({
        where: { name: 'Demo Fintech Company' },
      });

      if (!organization) {
        throw new Error('Organization not found - run step 1 first');
      }

      const userData = {
        email: 'admin@demo-fintech.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: UserRole.ADMIN,
        password: 'password123',
      };

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

      return {
        success: true,
        step: 'Users',
        data: {
          userId: user.id,
          email: user.email,
          organizationId: organization.id,
          hasId: !!user.id,
          hasOrgId: !!organization.id,
        }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Users',
        error: error.message,
        stack: error.stack,
      };
    }
  }

  async testStep4ComplianceProgress(): Promise<any> {
    try {
      console.log('🧪 Testing Step 4: ComplianceProgress creation...');
      
      // Get organization and frameworks first
      const organization = await this.organizationsRepository.findOne({
        where: { name: 'Demo Fintech Company' },
      });

      if (!organization) {
        throw new Error('Organization not found - run step 1 first');
      }

      const frameworks = await this.frameworksRepository.find();

      if (!frameworks || frameworks.length === 0) {
        throw new Error('Frameworks not found - run step 2 first');
      }

      const progressRecords = [];
      for (const framework of frameworks) {
        if (!framework || !framework.id) {
          throw new Error(`Framework missing ID: ${JSON.stringify(framework)}`);
        }

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

      return {
        success: true,
        step: 'ComplianceProgress',
        data: {
          count: progressRecords.length,
          organizationId: organization.id,
          frameworkCount: frameworks.length,
          progressRecords: progressRecords.map(p => ({
            id: p.id,
            frameworkId: p.framework?.id,
            organizationId: p.organization?.id,
            hasId: !!p.id,
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        step: 'ComplianceProgress',
        error: error.message,
        stack: error.stack,
      };
    }
  }
}