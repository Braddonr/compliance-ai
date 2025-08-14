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

  // Enable CORS for frontend with debugging
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://compliance-ai-1-3uf3.onrender.com",
  ].filter((origin): origin is string => Boolean(origin));

  console.log("🔧 CORS allowed origins:", allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      console.log("🌐 CORS request from origin:", origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS origin allowed:", origin);
        return callback(null, true);
      } else {
        console.log("❌ CORS origin blocked:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  const host = 'localhost';
  
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces

  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
}

bootstrap();
