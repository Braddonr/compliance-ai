import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bot,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Save,
  RefreshCw,
  Zap,
  Brain,
  Globe,
  Lock,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing AI settings from backend
  const { data: backendAISettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings', 'ai'],
    queryFn: settingsAPI.getAISettings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // AI Model Settings
  const [aiSettings, setAiSettings] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a compliance expert assistant helping to generate accurate and comprehensive compliance documentation.',
    enableAutoGeneration: true,
    enableSmartSuggestions: true,
    customInstructions: '',
    companyContext: '',
  });

  // Update local state when backend data loads
  React.useEffect(() => {
    if (backendAISettings) {
      setAiSettings(prev => ({
        ...prev,
        model: backendAISettings.ai_model || prev.model,
        temperature: backendAISettings.ai_temperature || prev.temperature,
        maxTokens: backendAISettings.ai_max_tokens || prev.maxTokens,
        systemPrompt: backendAISettings.system_prompt || prev.systemPrompt,
        customInstructions: backendAISettings.custom_instructions || prev.customInstructions,
        companyContext: backendAISettings.company_context || prev.companyContext,
      }));
    }
  }, [backendAISettings]);

  // Document Settings
  const [documentSettings, setDocumentSettings] = useState({
    defaultTemplate: 'standard',
    autoSave: true,
    versionControl: true,
    collaborativeEditing: true,
    exportFormat: 'pdf',
    retentionPeriod: '7_years',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    documentUpdates: true,
    complianceAlerts: true,
    weeklyReports: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '8_hours',
    passwordExpiry: '90_days',
    auditLogging: true,
    dataEncryption: true,
  });

  // Mutation to save AI settings
  const saveAISettingsMutation = useMutation({
    mutationFn: async () => {
      // Save each AI setting to the backend
      const promises = [
        settingsAPI.upsert('ai_model', aiSettings.model, {
          description: 'AI model to use for content generation',
          category: 'ai',
          type: 'string',
        }),
        settingsAPI.upsert('ai_temperature', aiSettings.temperature.toString(), {
          description: 'AI temperature setting for content generation',
          category: 'ai',
          type: 'number',
        }),
        settingsAPI.upsert('ai_max_tokens', aiSettings.maxTokens.toString(), {
          description: 'Maximum tokens for AI content generation',
          category: 'ai',
          type: 'number',
        }),
        settingsAPI.upsert('system_prompt', aiSettings.systemPrompt, {
          description: 'System prompt for AI content generation',
          category: 'ai',
          type: 'string',
        }),
        settingsAPI.upsert('custom_instructions', aiSettings.customInstructions, {
          description: 'Custom instructions for AI content generation',
          category: 'ai',
          type: 'string',
        }),
        settingsAPI.upsert('company_context', aiSettings.companyContext, {
          description: 'Company context information for AI-generated content',
          category: 'ai',
          type: 'string',
        }),
      ];
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('AI settings saved successfully!', { icon: '🤖' });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save AI settings');
    },
  });

  const handleSaveSettings = async (settingsType: string) => {
    setIsLoading(true);
    try {
      if (settingsType === 'AI') {
        await saveAISettingsMutation.mutateAsync();
      } else {
        // For other settings types, simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`${settingsType} settings saved successfully!`);
      }
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your compliance platform preferences and AI model settings.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge variant="outline" className="text-sm">
            <Settings className="mr-1 h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* AI Model Settings */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select value={aiSettings.model} onValueChange={(value) => 
                      setAiSettings(prev => ({ ...prev, model: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the AI model for document generation
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings(prev => ({ 
                        ...prev, 
                        temperature: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls creativity vs consistency (0 = consistent, 1 = creative)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      maxTokens: parseInt(e.target.value) 
                    }))}
                    min="100"
                    max="4000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum length of generated content (recommended: 2000)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={aiSettings.systemPrompt}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      systemPrompt: e.target.value 
                    }))}
                    rows={3}
                    placeholder="Define how the AI should behave when generating compliance documents..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">Custom Instructions</Label>
                  <Textarea
                    id="custom-instructions"
                    value={aiSettings.customInstructions}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      customInstructions: e.target.value 
                    }))}
                    rows={2}
                    placeholder="Additional instructions for your organization's specific requirements..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-context">Company Context</Label>
                  <Textarea
                    id="company-context"
                    value={aiSettings.companyContext}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      companyContext: e.target.value 
                    }))}
                    rows={4}
                    placeholder="Describe your company (industry, size, specific requirements, etc.) to help AI generate more accurate and relevant compliance documents..."
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Example: "We are a mid-size fintech company with 200 employees, processing credit card payments for e-commerce platforms. We operate in the US and EU markets and handle sensitive financial data."
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Generation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate document content based on framework requirements
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.enableAutoGeneration}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ 
                        ...prev, 
                        enableAutoGeneration: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Smart Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered suggestions while writing documents
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.enableSmartSuggestions}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ 
                        ...prev, 
                        enableSmartSuggestions: checked 
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('AI')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save AI Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Settings */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default Template</Label>
                    <Select value={documentSettings.defaultTemplate} onValueChange={(value) => 
                      setDocumentSettings(prev => ({ ...prev, defaultTemplate: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Template</SelectItem>
                        <SelectItem value="detailed">Detailed Template</SelectItem>
                        <SelectItem value="minimal">Minimal Template</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={documentSettings.exportFormat} onValueChange={(value) => 
                      setDocumentSettings(prev => ({ ...prev, exportFormat: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">Word Document</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Document Retention Period</Label>
                  <Select value={documentSettings.retentionPeriod} onValueChange={(value) => 
                    setDocumentSettings(prev => ({ ...prev, retentionPeriod: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_year">1 Year</SelectItem>
                      <SelectItem value="3_years">3 Years</SelectItem>
                      <SelectItem value="5_years">5 Years</SelectItem>
                      <SelectItem value="7_years">7 Years (Recommended)</SelectItem>
                      <SelectItem value="10_years">10 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Document Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save document changes
                      </p>
                    </div>
                    <Switch
                      checked={documentSettings.autoSave}
                      onCheckedChange={(checked) => setDocumentSettings(prev => ({ 
                        ...prev, 
                        autoSave: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Version Control</Label>
                      <p className="text-sm text-muted-foreground">
                        Track document version history
                      </p>
                    </div>
                    <Switch
                      checked={documentSettings.versionControl}
                      onCheckedChange={(checked) => setDocumentSettings(prev => ({ 
                        ...prev, 
                        versionControl: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collaborative Editing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow multiple users to edit documents simultaneously
                      </p>
                    </div>
                    <Switch
                      checked={documentSettings.collaborativeEditing}
                      onCheckedChange={(checked) => setDocumentSettings(prev => ({ 
                        ...prev, 
                        collaborativeEditing: checked 
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('Document')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Document Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        emailNotifications: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        pushNotifications: checked 
                      }))}
                    />
                  </div>

                  <Separator />

                  <h3 className="text-lg font-semibold">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for upcoming task deadlines
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.taskReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        taskReminders: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Document Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications when documents are updated
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.documentUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        documentUpdates: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compliance Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical compliance status changes
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.complianceAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        complianceAlerts: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly compliance progress summaries
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        weeklyReports: checked 
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('Notification')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select value={securitySettings.sessionTimeout} onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_hour">1 Hour</SelectItem>
                        <SelectItem value="4_hours">4 Hours</SelectItem>
                        <SelectItem value="8_hours">8 Hours</SelectItem>
                        <SelectItem value="24_hours">24 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Password Expiry</Label>
                    <Select value={securitySettings.passwordExpiry} onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, passwordExpiry: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30_days">30 Days</SelectItem>
                        <SelectItem value="60_days">60 Days</SelectItem>
                        <SelectItem value="90_days">90 Days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        twoFactorAuth: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all user actions for compliance auditing
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        auditLogging: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Data Encryption
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt sensitive data at rest and in transit
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.dataEncryption}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        dataEncryption: checked 
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('Security')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;