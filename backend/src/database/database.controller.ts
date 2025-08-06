import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  async seedDatabase() {
    try {
      await this.seederService.seed();
      return { 
        success: true, 
        message: 'Database seeded successfully!' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Seeding failed', 
        error: error.message 
      };
    }
  }

  @Get('health')
  healthCheck() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}