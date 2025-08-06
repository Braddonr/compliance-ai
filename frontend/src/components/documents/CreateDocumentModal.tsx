import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/ui/rich-text-editor';
import {
  FileText,
  Sparkles,
  Loader2,
  Plus,
  X,
  Wand2,
} from 'lucide-react';
import { documentsAPI, complianceAPI, aiAPI, settingsAPI } from '@/lib/api';

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  frameworkId: z.string().min(1, 'Framework is required'),
  content: z.string().min(1, 'Content is required'),
  requirements: z.array(z.string()).optional(),
  useAI: z.boolean().optional(),
});

type CreateDocumentFormData = z.infer<typeof createDocumentSchema>;

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  organizationId,
}) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [customRequirements, setCustomRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDocumentFormData>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      content: '',
      useAI: false,
      requirements: [],
    },
  });

  const watchedFramework = watch('frameworkId');
  const watchedContent = watch('content');
  const watchedUseAI = watch('useAI');

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: complianceAPI.getFrameworks,
  });

  // Fetch company context from settings
  const { data: companyContext } = useQuery({
    queryKey: ['settings', 'company-context'],
    queryFn: settingsAPI.getCompanyContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => documentsAPI.create(data),
    onSuccess: () => {
      toast.success('Document created successfully!', { icon: '🎉' });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create document');
    },
  });

  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: (data: {
      framework: string;
      requirements: string[];
      title?: string;
      description?: string;
      companyContext?: string;
    }) => aiAPI.generateDocument(data),
    onSuccess: (data) => {
      setAiGeneratedContent(data);
      setValue('content', data);
      setShowAIPreview(true);
      setIsGenerating(false);
      toast.success('AI content generated successfully!', { icon: '✨' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content');
      setIsGenerating(false);
    },
  });

  const handleClose = () => {
    reset();
    setCustomRequirements([]);
    setNewRequirement('');
    setActiveTab('manual');
    setIsGenerating(false);
    setShowAIPreview(false);
    setAiGeneratedContent('');
    setIsEditorExpanded(false);
    onClose();
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !customRequirements.includes(newRequirement.trim())) {
      const updated = [...customRequirements, newRequirement.trim()];
      setCustomRequirements(updated);
      setValue('requirements', updated);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    const updated = customRequirements.filter(req => req !== requirement);
    setCustomRequirements(updated);
    setValue('requirements', updated);
  };

  const generateAIContent = async () => {
    const title = watch('title');
    const description = watch('description');
    
    if (!watchedFramework) {
      toast.error('Please select a framework first');
      return;
    }
    
    if (!title?.trim()) {
      toast.error('Please enter a document title first');
      return;
    }

    setIsGenerating(true);
    const selectedFramework = frameworks?.find(f => f.id === watchedFramework);
    
    // Create a comprehensive prompt for the AI with company context
    const aiData = {
      framework: selectedFramework?.displayName || selectedFramework?.name || '',
      requirements: customRequirements.length > 0 ? customRequirements : [
        'Security Controls',
        'Risk Assessment',
        'Documentation Requirements',
        'Compliance Monitoring',
      ],
      title,
      description: description || '',
      companyContext: companyContext || '', // Include company context from settings
    };
    
    generateMutation.mutate(aiData);
  };

  const onSubmit = (data: CreateDocumentFormData) => {
    createMutation.mutate({
      ...data,
      organizationId,
      progress: 0,
      status: 'draft',
      changeLog: 'Initial document creation',
    });
  };

  const commonRequirements = {
    'PCI-DSS': [
      'Network Security Controls',
      'Cardholder Data Protection',
      'Access Control Measures',
      'Network Monitoring',
      'Security Testing',
      'Information Security Policy',
    ],
    'SOC2': [
      'Security Controls',
      'Availability Controls',
      'Processing Integrity',
      'Confidentiality Controls',
      'Privacy Controls',
      'Risk Assessment',
    ],
    'GDPR': [
      'Data Processing Agreements',
      'Privacy Impact Assessments',
      'Data Subject Rights',
      'Consent Management',
      'Data Breach Procedures',
      'Privacy by Design',
    ],
    'ISO27001': [
      'Information Security Policy',
      'Risk Management',
      'Asset Management',
      'Access Control',
      'Incident Management',
      'Business Continuity',
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Create New Document
              </DialogTitle>
              <DialogDescription>
                Create a new compliance document manually or use AI to generate content based on your requirements.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                {/* Tabs Header */}
                <div className="flex-shrink-0 px-6 pt-4 border-b">
                  <TabsList className="w-fit mb-4">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Manual Creation
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI-Powered
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="px-6 py-4 space-y-6">
                    {/* Basic Information - Always visible */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Document Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., PCI-DSS Compliance Documentation"
                          {...register('title')}
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="framework">Compliance Framework *</Label>
                        <Select onValueChange={(value) => setValue('frameworkId', value)}>
                          <SelectTrigger className={errors.frameworkId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                          <SelectContent>
                            {frameworks?.map((framework: any) => (
                              <SelectItem key={framework.id} value={framework.id}>
                                {framework.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.frameworkId && (
                          <p className="text-sm text-red-500">{errors.frameworkId.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the document purpose and scope"
                        {...register('description')}
                        rows={3}
                      />
                    </div>

                    {/* Tab Content */}
                    <TabsContent value="manual" className="mt-0">
                      <div className="space-y-2">
                        <Label>Document Content *</Label>
                        <RichTextEditor
                          content={watchedContent}
                          onChange={(content) => setValue('content', content)}
                          placeholder="Start writing your compliance document..."
                          title={watch('title') || 'New Document'}
                          framework={frameworks?.find(f => f.id === watchedFramework)?.displayName}
                          isAIGenerated={false}
                        />
                        {errors.content && (
                          <p className="text-sm text-red-500">{errors.content.message}</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0 space-y-6">
                    {!showAIPreview ? (
                      /* AI Setup Phase */
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium text-blue-900">AI-Powered Content Generation</h3>
                        </div>
                        <p className="text-sm text-blue-700 mb-4">
                          Fill in the document details above, select requirements below, and let AI generate comprehensive compliance documentation for you.
                        </p>
                        
                        {/* Requirements Selection */}
                        {watchedFramework && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Common Requirements</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {commonRequirements[frameworks?.find(f => f.id === watchedFramework)?.displayName as keyof typeof commonRequirements]?.map((req) => (
                                  <Badge
                                    key={req}
                                    variant={customRequirements.includes(req) ? "default" : "outline"}
                                    className="cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      if (customRequirements.includes(req)) {
                                        removeRequirement(req);
                                      } else {
                                        const updated = [...customRequirements, req];
                                        setCustomRequirements(updated);
                                        setValue('requirements', updated);
                                      }
                                    }}
                                  >
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Custom Requirements</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Add custom requirement"
                                  value={newRequirement}
                                  onChange={(e) => setNewRequirement(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                />
                                <Button type="button" onClick={addRequirement} size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {customRequirements.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {customRequirements.map((req) => (
                                    <Badge key={req} variant="secondary" className="flex items-center gap-1">
                                      {req}
                                      <X
                                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                                        onClick={() => removeRequirement(req)}
                                      />
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">Ready to Generate?</h4>
                                  <p className="text-sm opacity-90">
                                    {customRequirements.length} requirements selected
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  onClick={generateAIContent}
                                  disabled={isGenerating || !watchedFramework}
                                  variant="secondary"
                                  className="bg-white text-blue-600 hover:bg-gray-100"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-4 w-4 mr-2" />
                                      Generate AI Content
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              {isGenerating && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                  <div className="flex items-center gap-3">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm opacity-90">
                                      AI is crafting your compliance document...
                                    </span>
                                  </div>
                                  <div className="mt-2 text-xs opacity-75">
                                    This may take a few moments while we generate comprehensive content.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!watchedFramework && (
                          <div className="text-center py-8 text-gray-500">
                            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Please select a framework above to continue</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* AI Preview & Edit Phase */
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-green-600" />
                              <h3 className="font-medium text-green-900">AI Content Generated!</h3>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowAIPreview(false);
                                  setAiGeneratedContent('');
                                  setValue('content', '');
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Start Over
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateAIContent}
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Wand2 className="h-4 w-4 mr-2" />
                                )}
                                Regenerate
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-green-700 mt-2">
                            Review the generated content below. You can edit it if needed, then save when you're satisfied.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Generated Document Content
                            <Badge variant="secondary" className="text-xs">
                              AI Generated
                            </Badge>
                          </Label>
                          <RichTextEditor
                            content={watchedContent}
                            onChange={(content) => setValue('content', content)}
                            placeholder="AI-generated content will appear here..."
                            isExpanded={isEditorExpanded}
                            onToggleExpand={() => setIsEditorExpanded(!isEditorExpanded)}
                            title={watch('title') || 'New Document'}
                            framework={frameworks?.find(f => f.id === watchedFramework)?.displayName}
                            isAIGenerated={true}
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: You can edit the content above to customize it further before saving. Click the expand icon to get more editing space.
                          </p>
                        </div>
                      </div>
                    )}
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
              
              {/* Footer */}
              <div className="border-t p-6 flex justify-end gap-2 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || isGenerating}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentModal;