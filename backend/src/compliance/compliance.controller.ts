import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ParseUUIDPipe 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('frameworks')
  @ApiOperation({ summary: 'Get all compliance frameworks' })
  @ApiResponse({ status: 200, description: 'Frameworks retrieved successfully' })
  getFrameworks() {
    return this.complianceService.getFrameworks();
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get compliance progress for organization' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  getProgress(@Request() req) {
    // In a real app, you'd get organizationId from the user's JWT token
    // For now, we'll use a placeholder
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.complianceService.getProgress(organizationId);
  }

  @Get('progress/:frameworkId')
  @ApiOperation({ summary: 'Get compliance progress for specific framework' })
  @ApiResponse({ status: 200, description: 'Framework progress retrieved successfully' })
  getProgressByFramework(
    @Request() req,
    @Param('frameworkId', ParseUUIDPipe) frameworkId: string,
  ) {
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.complianceService.getProgressByFramework(organizationId, frameworkId);
  }

  @Get('tasks/priority')
  @ApiOperation({ summary: 'Get high priority tasks' })
  @ApiResponse({ status: 200, description: 'Priority tasks retrieved successfully' })
  getPriorityTasks(@Request() req) {
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.complianceService.getPriorityTasks(organizationId);
  }

  @Get('progress/:progressId/tasks')
  @ApiOperation({ summary: 'Get tasks for compliance progress' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  getTasks(@Param('progressId', ParseUUIDPipe) progressId: string) {
    return this.complianceService.getTasks(progressId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a new compliance task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.complianceService.createTask(createTaskDto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a compliance task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.complianceService.updateTask(id, updateTaskDto);
  }
}