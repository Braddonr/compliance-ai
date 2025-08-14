import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../users/entities/organization.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SimpleSeederService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async simpleSeed(): Promise<void> {
    console.log('🌱 Starting simple database seeding...');

    try {
      // Create organization first
      console.log('📊 Creating organization...');
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
        console.log(`✅ Organization created with ID: ${organization.id}`);
      } else {
        console.log(`✅ Organization already exists with ID: ${organization.id}`);
      }

      // Create a single user
      console.log('👥 Creating admin user...');
      let user = await this.usersRepository.findOne({
        where: { email: 'admin@demo-fintech.com' },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = this.usersRepository.create({
          email: 'admin@demo-fintech.com',
          firstName: 'Alex',
          lastName: 'Johnson',
          role: UserRole.ADMIN,
          password: hashedPassword,
          organization,
        });
        user = await this.usersRepository.save(user);
        console.log(`✅ User created with ID: ${user.id}`);
      } else {
        console.log(`✅ User already exists with ID: ${user.id}`);
      }

      console.log('✅ Simple database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Simple database seeding failed:', error);
      throw error;
    }
  }
}