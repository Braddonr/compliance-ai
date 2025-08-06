import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { complianceAPI, documentsAPI } from "@/lib/api";
import ComplianceProgressTracker from "./ComplianceProgressTracker";
import DocumentGrid from "./DocumentGrid";
import DocumentViewModal from "./documents/DocumentViewModal";
import CreateDocumentModal from "./documents/CreateDocumentModal";
import ExportReportModal from "./reports/ExportReportModal";

const Home = () => {
  const { user, logout } = useAuth();
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch compliance progress
  const { data: complianceProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["compliance-progress"],
    queryFn: complianceAPI.getProgress,
    onError: (error: any) => {
      toast.error("Failed to load compliance progress");
      console.error("Compliance progress error:", error);
    },
  });

  // Fetch frameworks
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ["frameworks"],
    queryFn: complianceAPI.getFrameworks,
    onError: (error: any) => {
      toast.error("Failed to load frameworks");
      console.error("Frameworks error:", error);
    },
  });

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["documents", selectedFramework],
    queryFn: () => {
      const frameworkId =
        selectedFramework === "all" ? undefined : selectedFramework;
      return documentsAPI.getAll(frameworkId);
    },
    onError: (error: any) => {
      toast.error("Failed to load documents");
      console.error("Documents error:", error);
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsDocumentModalOpen(true);
  };

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true);
  };

  const handleExportReport = () => {
    setIsExportModalOpen(true);
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
        className="space-y-6"
      >
        {/* Dashboard Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Monitor your compliance progress and recent documents.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>Export Report</Button>
            <Button onClick={handleCreateDocument}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </motion.div>

        {/* Compliance Progress Section */}
        <motion.div variants={itemVariants}>
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
        organizationId="203ed168-e9d5-42a4-809c-a09f5952d697"
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        complianceProgress={complianceProgress || []}
        documents={documents || []}
        frameworks={frameworks || []}
      />
    </>
  );
};

export default Home;
