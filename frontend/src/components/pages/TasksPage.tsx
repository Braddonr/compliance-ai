import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User,
  Target,
  Plus,
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { complianceAPI } from '@/lib/api';
import { formatStatus, getTaskStatusColor } from '@/lib/status-utils';
import CreateTaskModal from '../tasks/CreateTaskModal';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch compliance progress (contains tasks)
  const { data: complianceProgress, isLoading: tasksLoading } = useQuery({
    queryKey: ['compliance-progress'],
    queryFn: complianceAPI.getProgress,
    onError: (error: any) => {
      toast.error('Failed to load tasks');
      console.error('Tasks error:', error);
    },
  });

  // Extract all tasks from compliance progress
  const allTasks = complianceProgress?.flatMap((progress: any) => 
    progress.tasks?.map((task: any) => ({
      ...task,
      framework: progress.framework,
    })) || []
  ) || [];

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => complianceAPI.deleteTask(taskId),
    onSuccess: () => {
      toast.success('Task deleted successfully!', { icon: '🗑️' });
      queryClient.invalidateQueries({ queryKey: ['compliance-progress'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDeleteDialogOpen(false);
      setDeleteTaskId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  // Update task status mutation (for quick status changes)
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => 
      complianceAPI.updateTask(taskId, data),
    onSuccess: () => {
      toast.success('Task updated successfully!', { icon: '✅' });
      queryClient.invalidateQueries({ queryKey: ['compliance-progress'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: complianceAPI.getFrameworks,
  });

  // Filter tasks from backend data
  const filteredTasks = (allTasks || []).filter((task: any) => {
    const matchesSearch = task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesFramework = selectedFramework === 'all' || task.framework?.id === selectedFramework;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesFramework;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStats = () => {
    const tasks = allTasks || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  };

  const stats = getTaskStats();

  // Handlers
  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTaskId) {
      deleteTaskMutation.mutate(deleteTaskId);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({
      taskId,
      data: { status: newStatus }
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedTasks.length === 0) {
      toast.error('Please select tasks first');
      return;
    }

    switch (action) {
      case 'complete':
        selectedTasks.forEach(taskId => {
          updateTaskMutation.mutate({
            taskId,
            data: { status: 'completed' }
          });
        });
        setSelectedTasks([]);
        break;
      case 'delete':
        selectedTasks.forEach(taskId => {
          deleteTaskMutation.mutate(taskId);
        });
        setSelectedTasks([]);
        break;
      default:
        break;
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
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage your compliance tasks across all frameworks.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={selectedTasks.length === 0}>
                <Target className="mr-2 h-4 w-4" />
                Bulk Actions ({selectedTasks.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('complete')}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleBulkAction('delete')}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all frameworks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <Progress value={(stats.completed / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <Progress value={(stats.inProgress / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
            <Progress value={(stats.pending / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Framework Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
          <TabsList>
            <TabsTrigger value="all">All Frameworks</TabsTrigger>
            {frameworks?.map((framework: any) => (
              <TabsTrigger key={framework.id} value={framework.id}>
                {framework.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedFramework} className="mt-6">
            {tasksLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading tasks...</span>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task: any) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    whileHover={{ x: 2 }}
                    className="cursor-pointer"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {task.name || `Task for ${task.framework?.displayName}`}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {task.description || 'No description available'}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge className={getTaskStatusColor(task.status)}>
                                  {formatStatus(task.status)}
                                </Badge>
                                {task.priority && (
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority} priority
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {task.framework?.displayName}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {task.assignee && (
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {!tasksLoading && filteredTasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Tasks will appear here as you progress through compliance frameworks.'
                    }
                  </p>
                  <Button onClick={handleCreateTask}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId="203ed168-e9d5-42a4-809c-a09f5952d697"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteTaskId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteTaskMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default TasksPage;