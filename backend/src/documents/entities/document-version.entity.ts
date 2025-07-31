import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  changeLog?: string;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Document, (document) => document.versions)
  document: Document;

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}