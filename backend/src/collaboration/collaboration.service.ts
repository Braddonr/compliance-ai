import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async getCommentsByDocument(documentId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { document: { id: documentId } },
      relations: ['author', 'replies'],
    });
  }

  // Additional methods will be implemented as needed
}