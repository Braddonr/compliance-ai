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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { documentsAPI, usersAPI } from "@/lib/api";

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
  const [editedStatus, setEditedStatus] = useState("");
  const [editedCollaborators, setEditedCollaborators] = useState<string[]>([]);
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

  // Fetch users for collaborators selection
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      status: string;
      changeLog: string;
    }) => {
      // Update document basic info (without collaborators)
      const updatedDoc = await documentsAPI.update(documentId!, data);

      // Handle collaborators separately
      const currentCollaboratorIds =
        document?.collaborators?.map((c: any) => c.id) || [];
      const newCollaboratorIds = editedCollaborators;

      // Find collaborators to add and remove
      const toAdd = newCollaboratorIds.filter(
        (id) => !currentCollaboratorIds.includes(id)
      );
      const toRemove = currentCollaboratorIds.filter(
        (id) => !newCollaboratorIds.includes(id)
      );

      // Add new collaborators
      for (const userId of toAdd) {
        await documentsAPI.addCollaborator(documentId!, userId);
      }

      // Remove old collaborators
      for (const userId of toRemove) {
        await documentsAPI.removeCollaborator(documentId!, userId);
      }

      return updatedDoc;
    },
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
      setEditedStatus(document.status || "draft");
      setEditedCollaborators(
        document.collaborators?.map((c: any) => c.id) || []
      );
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
      status: editedStatus,
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
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-blue-100 text-blue-800";
      case "archived":
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
                            setEditedStatus(document?.status || "draft");
                            setEditedCollaborators(
                              document?.collaborators?.map((c: any) => c.id) ||
                                []
                            );
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
                    {/* Status and Collaborators Editing (only in edit mode) */}
                    {isEditing && (
                      <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Document Settings
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Status Selection */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="status"
                              className="text-sm font-medium"
                            >
                              Status
                            </Label>
                            <Select
                              value={editedStatus}
                              onValueChange={setEditedStatus}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    Draft
                                  </div>
                                </SelectItem>
                                <SelectItem value="in_review">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    In Review
                                  </div>
                                </SelectItem>
                                <SelectItem value="published">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Published
                                  </div>
                                </SelectItem>
                                <SelectItem value="approved">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Approved
                                  </div>
                                </SelectItem>
                                <SelectItem value="archived">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    Archived
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Collaborators Selection */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Collaborators
                            </Label>
                            <div className="border rounded-md p-3 max-h-32 overflow-y-auto bg-background">
                              {users && users.length > 0 ? (
                                <div className="space-y-2">
                                  {users.slice(0, 8).map((user: any) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`edit-collaborator-${user.id}`}
                                        checked={editedCollaborators.includes(
                                          user.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setEditedCollaborators([
                                              ...editedCollaborators,
                                              user.id,
                                            ]);
                                          } else {
                                            setEditedCollaborators(
                                              editedCollaborators.filter(
                                                (id) => id !== user.id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`edit-collaborator-${user.id}`}
                                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                                      >
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage
                                            src={
                                              user.avatar ||
                                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`
                                            }
                                            alt={`${user.firstName} ${user.lastName}`}
                                          />
                                          <AvatarFallback className="text-xs">
                                            {user.firstName?.charAt(0)}
                                            {user.lastName?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {user.firstName} {user.lastName}
                                      </Label>
                                    </div>
                                  ))}
                                  {users.length > 8 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{users.length - 8} more users available
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No users available for collaboration
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Document Content Editor */}
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
