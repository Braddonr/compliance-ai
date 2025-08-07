import { Controller, Post, Get } from "@nestjs/common";
import { SeederService } from "./seeder.service";
import { SimpleSeederService } from "./simple-seeder.service";
import { TestEntitiesService } from "./test-entities.service";

@Controller("database")
export class DatabaseController {
  constructor(
    private readonly seederService: SeederService,
    private readonly simpleSeederService: SimpleSeederService,
    private readonly testEntitiesService: TestEntitiesService
  ) {}

  @Post("seed")
  async seedDatabase() {
    try {
      await this.seederService.seed();
      return {
        success: true,
        message: "Database seeded successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: "Seeding failed",
        error: error.message,
      };
    }
  }

  @Post("seed-simple")
  async seedDatabaseSimple() {
    try {
      await this.simpleSeederService.simpleSeed();
      return {
        success: true,
        message: "Simple database seeding completed successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: "Simple seeding failed",
        error: error.message,
      };
    }
  }

  @Post("test-entities")
  async testEntities() {
    return await this.testEntitiesService.testCreateOrganization();
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
