import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Edit3,
  Save,
  X,
  Clock,
  Users,
  FileText,
  History,
  Download,
  Share,
  Loader2,
} from "lucide-react";
import { documentsAPI } from "@/lib/api";

interface DocumentViewModalProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  documentId,
  isOpen,
  onClose,
  startInEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const queryClient = useQueryClient();

  // Fetch document details
  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentsAPI.getById(documentId!),
    enabled: !!documentId && isOpen,
  });

  // Fetch document versions
  const { data: versions } = useQuery({
    queryKey: ["document-versions", documentId],
    queryFn: () => documentsAPI.getVersions(documentId!),
    enabled: !!documentId && isOpen,
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: (data: { title: string; content: string; changeLog: string }) =>
      documentsAPI.update(documentId!, data),
    onSuccess: () => {
      toast.success("Document updated successfully!", { icon: "✅" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({
        queryKey: ["document-versions", documentId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update document");
    },
  });

  useEffect(() => {
    if (document) {
      setEditedContent(document.content || "");
      setEditedTitle(document.title || "");
    }
  }, [document]);

  useEffect(() => {
    setIsEditing(startInEditMode);
  }, [startInEditMode, isOpen]);

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEditedContent("");
      setEditedTitle("");
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!editedTitle.trim()) {
      toast.error("Document title is required");
      return;
    }

    updateMutation.mutate({
      title: editedTitle,
      content: editedContent,
      changeLog: "Document updated via web interface",
    });
  };

  const handleDownload = () => {
    toast.success("Download started!", { icon: "📥" });
    // Implement actual download logic here
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Document link copied to clipboard!", { icon: "📋" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen || !documentId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-96"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading document...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-96 text-red-500"
            >
              <X className="h-8 w-8 mr-2" />
              <span>Failed to load document</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b pr-16">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none w-full"
                      />
                    ) : (
                      <DialogTitle className="text-2xl font-bold">
                        {document?.title}
                      </DialogTitle>
                    )}
                    <DialogDescription className="mt-2 flex items-center gap-4 flex-wrap">
                      <Badge className={getStatusColor(document?.status)}>
                        {document?.status?.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {document?.framework?.displayName}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(document?.updatedAt).toLocaleDateString()}
                      </span>
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          size="sm"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedContent(document?.content || "");
                            setEditedTitle(document?.title || "");
                          }}
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleShare}
                          size="sm"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button onClick={() => setIsEditing(true)} size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress and Collaborators */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Progress:</span>
                      <Progress
                        value={document?.progress || 0}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(document?.progress || 0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {document?.collaborators
                        ?.slice(0, 3)
                        .map((collaborator: any) => (
                          <Avatar
                            key={collaborator.id}
                            className="h-6 w-6 border-2 border-background"
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
                      {(document?.collaborators?.length || 0) > 3 && (
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs bg-muted">
                            +{(document?.collaborators?.length || 0) - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="content" className="h-full flex flex-col">
                  <TabsList className="mx-6 mt-4 w-fit">
                    <TabsTrigger
                      value="content"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger
                      value="versions"
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      Versions ({versions?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="content"
                    className="flex-1 overflow-auto p-6 pt-4"
                  >
                    {document && (
                      <RichTextEditor
                        key={`${documentId}-${document.updatedAt}`}
                        content={editedContent}
                        onChange={setEditedContent}
                        editable={isEditing}
                        placeholder="Start writing your compliance document..."
                      />
                    )}
                  </TabsContent>

                  <TabsContent
                    value="versions"
                    className="flex-1 overflow-auto p-6 pt-4"
                  >
                    <div className="space-y-4">
                      {versions?.map((version: any, index: number) => (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                v{version.version}
                              </Badge>
                              <span className="text-sm font-medium">
                                {version.createdBy?.firstName}{" "}
                                {version.createdBy?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(version.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {version.changeLog && (
                            <p className="text-sm text-muted-foreground">
                              {version.changeLog}
                            </p>
                          )}
                        </motion.div>
                      ))}
                      {(!versions || versions.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No version history available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewModal;
