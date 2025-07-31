import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards, 
  Request,
  ParseUUIDPipe 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'framework', required: false, description: 'Filter by framework ID' })
  findAll(@Request() req, @Query('framework') frameworkId?: string) {
    const organizationId = req.user.organizationId || 'default-org-id';
    
    if (frameworkId) {
      return this.documentsService.getByFramework(frameworkId, organizationId);
    }
    
    return this.documentsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentsService.create(createDocumentDto, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.update(id, updateDocumentDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.remove(id);
  }

  @Post(':id/collaborators/:userId')
  @ApiOperation({ summary: 'Add collaborator to document' })
  @ApiResponse({ status: 200, description: 'Collaborator added successfully' })
  addCollaborator(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.documentsService.addCollaborator(documentId, userId);
  }

  @Delete(':id/collaborators/:userId')
  @ApiOperation({ summary: 'Remove collaborator from document' })
  @ApiResponse({ status: 200, description: 'Collaborator removed successfully' })
  removeCollaborator(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.documentsService.removeCollaborator(documentId, userId);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get document versions' })
  @ApiResponse({ status: 200, description: 'Document versions retrieved successfully' })
  getVersions(@Param('id', ParseUUIDPipe) documentId: string) {
    return this.documentsService.getVersions(documentId);
  }
}