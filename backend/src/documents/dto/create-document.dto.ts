import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ example: 'PCI-DSS Compliance Documentation' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Payment Card Industry Data Security Standard documentation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Document content in markdown or HTML format' })
  @IsString()
  content: string;

  @ApiProperty({ enum: DocumentStatus, default: DocumentStatus.DRAFT })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiProperty({ example: 0, description: 'Progress percentage (0-100)', required: false })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiProperty({ example: 'template-uuid', required: false })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({ example: { category: 'security', priority: 'high' }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: 'framework-uuid' })
  @IsUUID()
  frameworkId: string;

  @ApiProperty({ example: 'organization-uuid' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'Initial document creation', required: false })
  @IsString()
  @IsOptional()
  changeLog?: string;
}