import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Download,
  Loader2,
  PieChart,
} from 'lucide-react';
import { complianceAPI, documentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedFramework, setSelectedFramework] = useState('all');

  // Fetch compliance progress
  const { data: complianceProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['compliance-progress'],
    queryFn: complianceAPI.getProgress,
    onError: (error: any) => {
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', error);
    },
  });

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: complianceAPI.getFrameworks,
  });

  // Fetch documents for document analytics
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsAPI.getAll(),
  });

  // Calculate analytics data
  const getAnalyticsData = () => {
    if (!complianceProgress) return null;

    const totalTasks = complianceProgress.reduce((sum: number, progress: any) => 
      sum + (progress.totalTasks || 0), 0
    );
    const completedTasks = complianceProgress.reduce((sum: number, progress: any) => 
      sum + (progress.completedTasks || 0), 0
    );
    const inProgressTasks = complianceProgress.reduce((sum: number, progress: any) => 
      sum + (progress.inProgressTasks || 0), 0
    );
    const pendingTasks = complianceProgress.reduce((sum: number, progress: any) => 
      sum + (progress.pendingTasks || 0), 0
    );

    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overallProgress,
      totalFrameworks: complianceProgress.length,
      totalDocuments: documents?.length || 0,
    };
  };

  const analyticsData = getAnalyticsData();

  const getFrameworkPerformance = () => {
    if (!complianceProgress) return [];
    
    return complianceProgress.map((progress: any) => ({
      name: progress.framework?.displayName || 'Unknown',
      progress: progress.progressPercentage || 0,
      completed: progress.completedTasks || 0,
      total: progress.totalTasks || 0,
      trend: Math.random() > 0.5 ? 'up' : 'down', // Mock trend data
      change: Math.floor(Math.random() * 20) + 1,
    }));
  };

  const frameworkPerformance = getFrameworkPerformance();

  const getDocumentStats = () => {
    if (!documents) return { draft: 0, review: 0, approved: 0, archived: 0 };
    
    return documents.reduce((stats: any, doc: any) => {
      stats[doc.status] = (stats[doc.status] || 0) + 1;
      return stats;
    }, { draft: 0, review: 0, approved: 0, archived: 0 });
  };

  const documentStats = getDocumentStats();

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

  if (progressLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your compliance performance and track progress over time.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData ? Math.round(analyticsData.overallProgress) : 0}%
            </div>
            <Progress value={analyticsData?.overallProgress || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across all frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalTasks || 0}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Frameworks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalFrameworks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Compliance frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalDocuments || 0}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+5 this week</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Analytics Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="frameworks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="frameworks">Framework Performance</TabsTrigger>
            <TabsTrigger value="tasks">Task Analytics</TabsTrigger>
            <TabsTrigger value="documents">Document Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Framework Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworkPerformance.map((framework, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{framework.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {framework.completed}/{framework.total} tasks
                            </Badge>
                            <div className={`flex items-center gap-1 text-xs ${
                              framework.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {framework.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{framework.change}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={framework.progress} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(framework.progress)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData?.completedTasks || 0}
                  </div>
                  <Progress 
                    value={analyticsData ? (analyticsData.completedTasks / analyticsData.totalTasks) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {analyticsData?.inProgressTasks || 0}
                  </div>
                  <Progress 
                    value={analyticsData ? (analyticsData.inProgressTasks / analyticsData.totalTasks) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData?.pendingTasks || 0}
                  </div>
                  <Progress 
                    value={analyticsData ? (analyticsData.pendingTasks / analyticsData.totalTasks) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentStats.draft}</div>
                  <p className="text-xs text-muted-foreground">Documents in draft</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentStats.review}</div>
                  <p className="text-xs text-muted-foreground">Under review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentStats.approved}</div>
                  <p className="text-xs text-muted-foreground">Approved docs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Archived</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentStats.archived}</div>
                  <p className="text-xs text-muted-foreground">Archived docs</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;