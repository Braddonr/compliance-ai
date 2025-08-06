import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';

export interface CreateSettingDto {
  key: string;
  value: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  category?: string;
}

export interface UpdateSettingDto {
  value?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  category?: string;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async findAll(): Promise<Settings[]> {
    return this.settingsRepository.find({
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  async findByCategory(category: string): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { category },
      order: { key: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<Settings> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  async getValue(key: string): Promise<any> {
    const setting = await this.findByKey(key);
    return this.parseValue(setting.value, setting.type);
  }

  async getValueOrDefault(key: string, defaultValue: any): Promise<any> {
    try {
      return await this.getValue(key);
    } catch (error) {
      return defaultValue;
    }
  }

  async create(createSettingDto: CreateSettingDto): Promise<Settings> {
    const setting = this.settingsRepository.create(createSettingDto);
    return this.settingsRepository.save(setting);
  }

  async update(key: string, updateSettingDto: UpdateSettingDto): Promise<Settings> {
    const setting = await this.findByKey(key);
    Object.assign(setting, updateSettingDto);
    return this.settingsRepository.save(setting);
  }

  async upsert(key: string, value: string, options?: Partial<CreateSettingDto>): Promise<Settings> {
    try {
      const existingSetting = await this.findByKey(key);
      return this.update(key, { value, ...options });
    } catch (error) {
      return this.create({ key, value, ...options });
    }
  }

  async delete(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.settingsRepository.remove(setting);
  }

  // Helper method to parse values based on type
  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  // AI-specific settings methods
  async getCompanyContext(): Promise<string> {
    return this.getValueOrDefault('company_context', '');
  }

  async setCompanyContext(context: string): Promise<Settings> {
    return this.upsert('company_context', context, {
      description: 'Company context information for AI-generated content',
      category: 'ai',
      type: 'string',
    });
  }

  async getAISettings(): Promise<any> {
    const aiSettings = await this.findByCategory('ai');
    const settings: any = {};
    
    for (const setting of aiSettings) {
      settings[setting.key] = this.parseValue(setting.value, setting.type);
    }
    
    return settings;
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'company_context',
        value: '',
        description: 'Company context information for AI-generated content',
        category: 'ai',
        type: 'string' as const,
      },
      {
        key: 'ai_model',
        value: 'gpt-4',
        description: 'AI model to use for content generation',
        category: 'ai',
        type: 'string' as const,
      },
      {
        key: 'ai_temperature',
        value: '0.3',
        description: 'AI temperature setting for content generation',
        category: 'ai',
        type: 'number' as const,
      },
      {
        key: 'ai_max_tokens',
        value: '4000',
        description: 'Maximum tokens for AI content generation',
        category: 'ai',
        type: 'number' as const,
      },
      {
        key: 'document_retention_days',
        value: '2555', // 7 years
        description: 'Number of days to retain documents',
        category: 'documents',
        type: 'number' as const,
      },
    ];

    for (const setting of defaultSettings) {
      try {
        await this.findByKey(setting.key);
        // Setting exists, skip
      } catch (error) {
        // Setting doesn't exist, create it
        await this.create(setting);
      }
    }
  }
}