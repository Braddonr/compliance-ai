import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../users/entities/organization.entity';

@Injectable()
export class TestEntitiesService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async testCreateOrganization(): Promise<any> {
    try {
      console.log('🧪 Testing organization creation...');
      
      // Check if repository is available
      if (!this.organizationsRepository) {
        throw new Error('Organizations repository is not available');
      }

      // Try to find existing organizations
      console.log('📋 Checking existing organizations...');
      const existingOrgs = await this.organizationsRepository.find();
      console.log(`Found ${existingOrgs.length} existing organizations`);

      // Try to create a new organization
      console.log('🏢 Creating new organization...');
      const orgData = {
        name: 'Test Organization ' + Date.now(),
        description: 'Test organization for debugging',
        website: 'https://test.com',
        industry: 'Technology',
      };

      const organization = this.organizationsRepository.create(orgData);
      console.log('Organization entity created:', organization);

      const savedOrg = await this.organizationsRepository.save(organization);
      console.log('Organization saved with ID:', savedOrg.id);

      return {
        success: true,
        message: 'Organization created successfully',
        organization: savedOrg,
        existingCount: existingOrgs.length,
      };
    } catch (error) {
      console.error('❌ Error testing organization creation:', error);
      return {
        success: false,
        message: 'Failed to create organization',
        error: error.message,
        stack: error.stack,
      };
    }
  }
}