import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  selectionStart?: number;

  @Column({ nullable: true })
  selectionEnd?: number;

  @Column({ nullable: true })
  selectedText?: string;

  @Column({ default: false })
  isResolved: boolean;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @ManyToOne(() => Document, (document) => document.comments)
  document: Document;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parentComment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}