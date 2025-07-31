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
import { documentsAPI, complianceAPI, aiAPI } from '@/lib/api';

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
    mutationFn: ({ framework, requirements }: { framework: string; requirements: string[] }) =>
      aiAPI.generateDocument(framework, requirements),
    onSuccess: (data) => {
      setValue('content', data);
      toast.success('AI content generated successfully!', { icon: '✨' });
      setIsGenerating(false);
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
    if (!watchedFramework) {
      toast.error('Please select a framework first');
      return;
    }

    setIsGenerating(true);
    const selectedFramework = frameworks?.find(f => f.id === watchedFramework);
    
    generateMutation.mutate({
      framework: selectedFramework?.displayName || selectedFramework?.name || '',
      requirements: customRequirements.length > 0 ? customRequirements : [
        'Security Controls',
        'Risk Assessment',
        'Documentation Requirements',
        'Compliance Monitoring',
      ],
    });
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
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
          <div className="flex-1 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="mx-6 mt-4 w-fit">
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Manual Creation
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto p-6 pt-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
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

                  <div className="space-y-2 mb-6">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the document purpose and scope"
                      {...register('description')}
                      rows={3}
                    />
                  </div>

                  <TabsContent value="manual" className="mt-0">
                    <div className="space-y-2">
                      <Label>Document Content *</Label>
                      <RichTextEditor
                        content={watchedContent}
                        onChange={(content) => setValue('content', content)}
                        placeholder="Start writing your compliance document..."
                      />
                      {errors.content && (
                        <p className="text-sm text-red-500">{errors.content.message}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0 space-y-6">
                    {/* AI Options */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">AI-Powered Content Generation</h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">
                        Select requirements and let AI generate comprehensive compliance documentation for you.
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
                                  className="cursor-pointer"
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
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() => removeRequirement(req)}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            onClick={generateAIContent}
                            disabled={isGenerating || !watchedFramework}
                            className="w-full"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Generating Content...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate AI Content
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Generated Content */}
                    {watchedContent && (
                      <div className="space-y-2">
                        <Label>Generated Content</Label>
                        <RichTextEditor
                          content={watchedContent}
                          onChange={(content) => setValue('content', content)}
                          placeholder="AI-generated content will appear here..."
                        />
                      </div>
                    )}
                  </TabsContent>
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex justify-end gap-2">
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
              </Tabs>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentModal;