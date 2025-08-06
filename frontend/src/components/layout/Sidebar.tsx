import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  Clock,
  Target,
} from 'lucide-react';
import { complianceAPI } from '@/lib/api';

interface SidebarProps {
  onCreateDocument: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateDocument }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['frameworks']);

  // Fetch compliance progress for sidebar stats
  const { data: complianceProgress } = useQuery({
    queryKey: ['compliance-progress'],
    queryFn: complianceAPI.getProgress,
  });

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: complianceAPI.getFrameworks,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: '/documents',
      active: location.pathname.startsWith('/documents'),
      badge: complianceProgress?.reduce((total: number, progress: any) => 
        total + (progress.tasks?.length || 0), 0
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      path: '/tasks',
      active: location.pathname.startsWith('/tasks'),
      badge: complianceProgress?.reduce((total: number, progress: any) => 
        total + (progress.tasks?.filter((task: any) => task.status !== 'completed').length || 0), 0
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      active: location.pathname.startsWith('/analytics'),
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      path: '/team',
      active: location.pathname.startsWith('/team'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  const getFrameworkIcon = (frameworkName: string) => {
    switch (frameworkName) {
      case 'PCI-DSS':
        return '💳';
      case 'SOC2':
        return '🔒';
      case 'GDPR':
        return '🇪🇺';
      case 'ISO27001':
        return '📋';
      default:
        return '📄';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckSquare className="h-3 w-3 text-green-500" />;
    if (progress > 0) return <Clock className="h-3 w-3 text-yellow-500" />;
    return <AlertTriangle className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-card h-full">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Compliance Companion</h1>
            <p className="text-xs text-muted-foreground">Smart Compliance</p>
          </div>
        </div>

        {/* Quick Action */}
        <Button
          onClick={onCreateDocument}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mb-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto px-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  item.active ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Frameworks Section */}
        <Collapsible
          open={expandedSections.includes('frameworks')}
          onOpenChange={() => toggleSection('frameworks')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              {expandedSections.includes('frameworks') ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              <Target className="mr-2 h-4 w-4" />
              Frameworks
              <Badge variant="outline" className="ml-auto text-xs">
                {frameworks?.length || 0}
              </Badge>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {complianceProgress?.map((progress: any) => (
              <motion.div
                key={progress.framework?.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-4 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/documents?framework=${progress.framework?.id}`)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getFrameworkIcon(progress.framework?.displayName)}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {progress.framework?.displayName}
                    </span>
                  </div>
                  {getStatusIcon(progress.progressPercentage)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={progress.progressPercentage}
                    className="flex-1 h-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progress.progressPercentage)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{progress.completedTasks}/{progress.totalTasks} tasks</span>
                  <span className="flex items-center gap-1">
                    {progress.inProgressTasks > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {progress.inProgressTasks} active
                      </Badge>
                    )}
                  </span>
                </div>
              </motion.div>
            ))}
            {(!complianceProgress || complianceProgress.length === 0) && (
              <div className="ml-4 p-2 text-xs text-muted-foreground">
                No frameworks available
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-4" />

        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-2">Quick Stats</h3>
          
          {complianceProgress && complianceProgress.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Completed</span>
                </div>
                <span className="text-xs font-medium">
                  {complianceProgress.reduce((total: number, progress: any) => 
                    total + progress.completedTasks, 0
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">In Progress</span>
                </div>
                <span className="text-xs font-medium">
                  {complianceProgress.reduce((total: number, progress: any) => 
                    total + progress.inProgressTasks, 0
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-xs">Pending</span>
                </div>
                <span className="text-xs font-medium">
                  {complianceProgress.reduce((total: number, progress: any) => 
                    total + progress.pendingTasks, 0
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Compliance Companion
          </p>
          <p className="text-xs text-muted-foreground">
            Secure & Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;