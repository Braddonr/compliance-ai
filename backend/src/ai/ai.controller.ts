import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-document')
  async generateDocument(@Body() body: { 
    framework: string; 
    requirements: string[];
    title?: string;
    description?: string;
    companyContext?: string;
  }) {
    return this.aiService.generateComplianceDocument(
      body.framework, 
      body.requirements, 
      body.title, 
      body.description, 
      body.companyContext
    );
  }

  @Post('generate-report')
  async generateReport(@Body() body: {
    reportType: string;
    frameworks: string[];
    complianceData: any;
    includeCharts: boolean;
    includeRecommendations: boolean;
  }) {
    return this.aiService.generateComplianceReport(body);
  }

  @Post('analyze-compliance')
  async analyzeCompliance(@Body() body: {
    currentState: any;
    targetFramework: string;
    organizationContext?: string;
  }) {
    return this.aiService.analyzeComplianceGaps(body.currentState, body.targetFramework);
  }
}