import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('collaboration')
@Controller('collaboration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Get('documents/:id/comments')
  getComments(@Param('id') documentId: string) {
    return this.collaborationService.getCommentsByDocument(documentId);
  }
}