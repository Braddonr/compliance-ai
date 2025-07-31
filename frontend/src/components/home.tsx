import React, { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Settings,
  PlusCircle,
  FileText,
  Shield,
  ChevronRight,
  Search,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { complianceAPI, documentsAPI } from "@/lib/api";
import ComplianceProgressTracker from "./ComplianceProgressTracker";
import DocumentGrid from "./DocumentGrid";
import Sidebar from "./layout/Sidebar";
import DocumentViewModal from "./documents/DocumentViewModal";
import CreateDocumentModal from "./documents/CreateDocumentModal";

const Home = () => {
  const { user, logout } = useAuth();
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch compliance progress
  const { data: complianceProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['compliance-progress'],
    queryFn: complianceAPI.getProgress,
    onError: (error: any) => {
      toast.error('Failed to load compliance progress');
      console.error('Compliance progress error:', error);
    },
  });

  // Fetch frameworks
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: complianceAPI.getFrameworks,
    onError: (error: any) => {
      toast.error('Failed to load frameworks');
      console.error('Frameworks error:', error);
    },
  });

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['documents', selectedFramework],
    queryFn: () => {
      const frameworkId = selectedFramework === 'all' ? undefined : selectedFramework;
      return documentsAPI.getAll(frameworkId);
    },
    onError: (error: any) => {
      toast.error('Failed to load documents');
      console.error('Documents error:', error);
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsDocumentModalOpen(true);
  };

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true);
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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-screen bg-background"
      >
        {/* Enhanced Sidebar */}
        <Sidebar onCreateDocument={handleCreateDocument} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
        >
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Compliance AI</h1>
          </div>

          <div className="relative hidden md:block w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`}
                      alt={user?.firstName}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {user?.role?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Main Dashboard Content */}
        <main className="p-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Monitor your compliance progress and recent documents.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline">Export Report</Button>
              <Button onClick={handleCreateDocument}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
          </motion.div>

          {/* Compliance Progress Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Compliance Progress</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {progressLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading compliance progress...</span>
                </CardContent>
              </Card>
            ) : (
              <ComplianceProgressTracker frameworks={complianceProgress || []} />
            )}
          </motion.div>

          {/* Recent Documents Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Documents</h2>
            </div>

            <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {frameworks?.map((framework: any) => (
                  <TabsTrigger key={framework.id} value={framework.id}>
                    {framework.displayName}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedFramework} className="mt-0">
                {documentsLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading documents...</span>
                    </CardContent>
                  </Card>
                ) : (
                  <DocumentGrid 
                    documents={documents || []} 
                    onDocumentClick={handleDocumentClick}
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </motion.div>

    {/* Modals */}
    <DocumentViewModal
      documentId={selectedDocumentId}
      isOpen={isDocumentModalOpen}
      onClose={() => {
        setIsDocumentModalOpen(false);
        setSelectedDocumentId(null);
      }}
    />
    
    <CreateDocumentModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      organizationId="default-org-id" // In a real app, get this from user context
    />
  </>
  );
};

export default Home;
