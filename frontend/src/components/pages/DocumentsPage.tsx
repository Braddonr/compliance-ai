import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  User,
  Eye,
  Edit,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import { documentsAPI, complianceAPI } from "@/lib/api";
import { formatStatus, getDocumentStatusColor } from "@/lib/status-utils";
import DocumentViewModal from "../documents/DocumentViewModal";
import CreateDocumentModal from "../documents/CreateDocumentModal";
import ExportReportModal from "../reports/ExportReportModal";
import toast from "react-hot-toast";

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Handle URL parameters for framework filtering
  useEffect(() => {
    const frameworkParam = searchParams.get("framework");
    if (frameworkParam) {
      setSelectedFramework(frameworkParam);
    }
  }, [searchParams]);

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ["frameworks"],
    queryFn: complianceAPI.getFrameworks,
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

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentsAPI.delete(documentId),
    onSuccess: () => {
      toast.success("Document deleted successfully!", { icon: "🗑️" });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsDeleteDialogOpen(false);
      setDeleteDocumentId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete document");
    },
  });

  const handleDocumentClick = (documentId: string, editMode = false) => {
    setSelectedDocumentId(documentId);
    setStartInEditMode(editMode);
    setIsDocumentModalOpen(true);
  };

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteDocument = (documentId: string, documentTitle: string) => {
    setDeleteDocumentId(documentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteDocumentId) {
      deleteMutation.mutate(deleteDocumentId);
    }
  };

  // Filter documents based on search and status
  const filteredDocuments =
    documents?.filter((doc: any) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

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
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage and organize your compliance documentation.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
            <Button onClick={handleCreateDocument}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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
              {documentsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading documents...</span>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((document: any) => (
                    <motion.div
                      key={document.id}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      className="cursor-pointer"
                    >
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg line-clamp-1">
                                {document.title}
                              </CardTitle>
                            </div>
                            <Badge
                              className={`text-xs ${getDocumentStatusColor(
                                document.status
                              )}`}
                            >
                              {formatStatus(document.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {document.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 100)}
                            ...
                          </p>

                          <div className="space-y-2 text-xs text-muted-foreground">
                            {/* <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{document.author?.firstName} {document.author?.lastName}</span>
                            </div> */}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  document.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {document.framework && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {document.framework.displayName}
                                </Badge>
                              </div>
                            )}
                            {/* Contributors */}
                            {document.collaborators &&
                              document.collaborators.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  <span className="text-xs">
                                    Collaborator(s):
                                  </span>
                                  <div className="flex -space-x-1">
                                    {document.collaborators
                                      .slice(0, 3)
                                      .map((collaborator: any) => (
                                        <Avatar
                                          key={collaborator.id}
                                          className="h-5 w-5 border border-background"
                                        >
                                          <AvatarImage
                                            src={
                                              collaborator.avatar ||
                                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.firstName}`
                                            }
                                            alt={`${collaborator.firstName} ${collaborator.lastName}`}
                                          />
                                          <AvatarFallback className="text-xs">
                                            {collaborator.firstName?.charAt(0)}
                                            {collaborator.lastName?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                    {document.collaborators.length > 3 && (
                                      <Avatar className="h-5 w-5 border border-background">
                                        <AvatarFallback className="text-xs bg-muted">
                                          +{document.collaborators.length - 3}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentClick(document.id);
                              }}
                              className="flex-1"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentClick(document.id, true);
                              }}
                              className="flex-1"
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(
                                  document.id,
                                  document.title
                                );
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {!documentsLoading && filteredDocuments.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No documents found
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Get started by creating your first document."}
                    </p>
                    <Button onClick={handleCreateDocument}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <DocumentViewModal
        documentId={selectedDocumentId}
        isOpen={isDocumentModalOpen}
        startInEditMode={startInEditMode}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocumentId(null);
          setStartInEditMode(false);
        }}
      />

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId="203ed168-e9d5-42a4-809c-a09f5952d697"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone and will permanently remove the document and all its
              versions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteDocumentId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Document
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentsPage;
