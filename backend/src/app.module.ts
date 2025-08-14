import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ComplianceModule } from './compliance/compliance.module';
import { DocumentsModule } from './documents/documents.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // Load from root directory
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'compliance_ai',
      autoLoadEntities: true,
      synchronize: true, // Enable for initial deployment to create tables
      logging: process.env.NODE_ENV === 'production' ? ['error'] : false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      extra: {
        connectionLimit: 10,
      },
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    ComplianceModule,
    DocumentsModule,
    CollaborationModule,
    AiModule,
    DatabaseModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}