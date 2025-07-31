import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../users/entities/user.entity';
import { Organization } from '../users/entities/organization.entity';
import { Framework } from '../compliance/entities/framework.entity';
import { ComplianceProgress } from '../compliance/entities/compliance-progress.entity';
import { Task } from '../compliance/entities/task.entity';
import { Document } from '../documents/entities/document.entity';
import { DocumentVersion } from '../documents/entities/document-version.entity';
import { Comment } from '../collaboration/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      Framework,
      ComplianceProgress,
      Task,
      Document,
      DocumentVersion,
      Comment,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}