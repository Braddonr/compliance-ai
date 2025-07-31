import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  BarChart3,
  Users,
  CheckSquare,
  Calendar,
  Loader2,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react';
import { exportReportService } from '@/lib/exportService';
import toast from 'react-hot-toast';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  complianceProgress?: any[];
  documents?: any[];
  frameworks?: any[];
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  complianceProgress = [],
  documents = [],
  frameworks = [],
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeTeamData, setIncludeTeamData] = useState(false);
  const [dateRange, setDateRange] = useState('30_days');

  const handleFrameworkToggle = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const handleSelectAllFrameworks = () => {
    if (selectedFrameworks.length === frameworks.length) {
      setSelectedFrameworks([]);
    } else {
      setSelectedFrameworks(frameworks.map((f: any) => f.id));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportOptions = {
        format: exportFormat,
        type: reportType,
        frameworks: selectedFrameworks.length > 0 ? selectedFrameworks : frameworks.map((f: any) => f.id),
        includeCharts,
        includeDocuments,
        includeTasks,
        includeTeamData,
        dateRange,
        complianceProgress,
        documents,
        frameworks,
      };

      await exportReportService.generateReport(exportOptions);
      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}!`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />;
      case 'png': return <FileImage className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeDescription = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return 'Complete compliance overview with all metrics, charts, and detailed analysis';
      case 'executive':
        return 'High-level summary for executives with key metrics and trends';
      case 'framework_specific':
        return 'Detailed report focused on specific compliance frameworks';
      case 'task_summary':
        return 'Task-focused report showing completion status and assignments';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Compliance Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive compliance report with your selected preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Report Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="framework_specific">Framework-Specific</SelectItem>
                  <SelectItem value="task_summary">Task Summary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getReportTypeDescription(reportType)}
              </p>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'pdf', label: 'PDF Document', desc: 'Professional formatted report' },
                  { value: 'excel', label: 'Excel Spreadsheet', desc: 'Data analysis friendly' },
                  { value: 'csv', label: 'CSV Data', desc: 'Raw data export' },
                  { value: 'png', label: 'PNG Image', desc: 'Chart visualization' },
                ].map((format) => (
                  <div
                    key={format.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === format.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setExportFormat(format.value)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getFormatIcon(format.value)}
                      <span className="font-medium">{format.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{format.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Framework Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Frameworks
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllFrameworks}
                >
                  {selectedFrameworks.length === frameworks.length ? 'Deselect All' : 'Select All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {frameworks.map((framework: any) => (
                  <div key={framework.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={framework.id}
                      checked={selectedFrameworks.includes(framework.id)}
                      onCheckedChange={() => handleFrameworkToggle(framework.id)}
                    />
                    <Label htmlFor={framework.id} className="text-sm font-medium">
                      {framework.displayName}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedFrameworks.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No frameworks selected. All frameworks will be included.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Content Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Content Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <Label>Include Charts & Visualizations</Label>
                </div>
                <Checkbox
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <Label>Include Document Summary</Label>
                </div>
                <Checkbox
                  checked={includeDocuments}
                  onCheckedChange={setIncludeDocuments}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <Label>Include Task Details</Label>
                </div>
                <Checkbox
                  checked={includeTasks}
                  onCheckedChange={setIncludeTasks}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label>Include Team Performance</Label>
                </div>
                <Checkbox
                  checked={includeTeamData}
                  onCheckedChange={setIncludeTeamData}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7_days">Last 7 days</SelectItem>
                  <SelectItem value="30_days">Last 30 days</SelectItem>
                  <SelectItem value="90_days">Last 90 days</SelectItem>
                  <SelectItem value="6_months">Last 6 months</SelectItem>
                  <SelectItem value="1_year">Last year</SelectItem>
                  <SelectItem value="all_time">All time</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Report Type:</span>
                  <Badge variant="outline">{reportType.replace('_', ' ').toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Format:</span>
                  <Badge variant="outline">{exportFormat.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Frameworks:</span>
                  <Badge variant="outline">
                    {selectedFrameworks.length || frameworks.length} selected
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Date Range:</span>
                  <Badge variant="outline">{dateRange.replace('_', ' ')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReportModal;