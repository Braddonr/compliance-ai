import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService, CreateSettingDto, UpdateSettingDto } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get('ai')
  getAISettings() {
    return this.settingsService.getAISettings();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Post('upsert')
  upsert(@Body() body: { key: string; value: string; options?: Partial<CreateSettingDto> }) {
    return this.settingsService.upsert(body.key, body.value, body.options);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }

  // AI-specific endpoints
  @Get('ai/company-context')
  getCompanyContext() {
    return this.settingsService.getCompanyContext();
  }

  @Post('ai/company-context')
  setCompanyContext(@Body() body: { context: string }) {
    return this.settingsService.setCompanyContext(body.context);
  }

  @Post('initialize')
  initializeDefaults() {
    return this.settingsService.initializeDefaultSettings();
  }
}