import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { SeederService } from "./database/seeder.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Run database seeding in production
  if (process.env.NODE_ENV === "production") {
    try {
      console.log("🌱 Running database seeding...");
      const seederService = app.get(SeederService);
      await seederService.seed();
      console.log("✅ Database seeding completed successfully");
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      // Don't exit in production, continue with startup
      console.log(
        "⚠️ Continuing with application startup despite seeding failure"
      );
    }
  }

  // Enable CORS for frontend
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://compliance-ai-1-3uf3.onrender.com",
    "http://localhost:5173",
    "http://localhost:5174",
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("Compliance Companion API")
    .setDescription("AI-Powered Compliance Copilot API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
