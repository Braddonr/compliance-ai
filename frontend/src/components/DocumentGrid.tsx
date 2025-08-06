import React from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, Download, FileText, MoreHorizontal, Users, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  framework: "PCI-DSS" | "SOC2" | "GDPR" | "ISO27001";
  lastUpdated: string;
  progress: number;
  collaborators: Collaborator[];
}

interface DocumentGridProps {
  documents?: any[];
  onDocumentClick?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents = [],
  onDocumentClick = (id) => {
    toast.success(`Opening document: ${id}`);
  },
  onDownload = (id) => {
    toast.success(`Downloading document: ${id}`);
  },
}) => {
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

  if (documents.length === 0) {
    return (
      <div className="bg-background w-full">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No documents found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating your first compliance document.
          </p>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {documents.map((doc, index) => (
          <motion.div key={doc.id} variants={itemVariants}>
            <Card
              className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0 shadow-md"
              onClick={() => onDocumentClick(doc.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant={getBadgeVariant(doc.framework?.displayName || doc.framework?.name)}
                    className="mb-2"
                  >
                    {doc.framework?.displayName || doc.framework?.name}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(doc.id);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentClick(doc.id);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {doc.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${doc.progress || 0}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full ${getProgressColor(doc.progress || 0)}`}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>{Math.round(doc.progress || 0)}% Complete</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {doc.lastUpdated || 
                       (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Unknown')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                  <div className="flex -space-x-2">
                    <TooltipProvider>
                      {doc.collaborators && doc.collaborators.length > 0 ? (
                        <>
                          {doc.collaborators.slice(0, 3).map((collaborator: any) => (
                            <Tooltip key={collaborator.id}>
                              <TooltipTrigger asChild>
                                <Avatar className="h-7 w-7 border-2 border-background">
                                  <AvatarImage
                                    src={collaborator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.firstName}`}
                                    alt={`${collaborator.firstName} ${collaborator.lastName}`}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {collaborator.firstName?.charAt(0)}{collaborator.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{collaborator.firstName} {collaborator.lastName}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {doc.collaborators.length > 3 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-7 w-7 border-2 border-background">
                                  <AvatarFallback className="text-xs bg-muted">
                                    +{doc.collaborators.length - 3}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {doc.collaborators.length - 3} more collaborators
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <Avatar className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className="text-xs bg-muted">
                            {doc.createdBy?.firstName?.charAt(0)}{doc.createdBy?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    <span>
                      {doc.collaborators?.length || 0} collaborator{(doc.collaborators?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Helper functions
const getBadgeVariant = (framework: string) => {
  switch (framework) {
    case "PCI-DSS":
      return "default";
    case "SOC2":
      return "secondary";
    case "GDPR":
      return "outline";
    case "ISO27001":
      return "destructive";
    default:
      return "default";
  }
};

const getProgressColor = (progress: number) => {
  if (progress < 30) return "bg-destructive";
  if (progress < 70) return "bg-amber-500";
  return "bg-green-500";
};

// Default data for preview purposes
const defaultDocuments: Document[] = [
  {
    id: "1",
    title: "PCI-DSS Compliance Documentation",
    description:
      "Payment Card Industry Data Security Standard documentation for secure payment processing.",
    framework: "PCI-DSS",
    lastUpdated: "2 days ago",
    progress: 75,
    collaborators: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        initials: "AJ",
      },
      {
        id: "2",
        name: "Maria Garcia",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        initials: "MG",
      },
      {
        id: "3",
        name: "Sam Taylor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
        initials: "ST",
      },
      {
        id: "4",
        name: "Jamie Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
        initials: "JS",
      },
    ],
  },
  {
    id: "2",
    title: "SOC2 Type II Audit Preparation",
    description:
      "System and Organization Controls documentation for security, availability, and confidentiality.",
    framework: "SOC2",
    lastUpdated: "5 hours ago",
    progress: 45,
    collaborators: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        initials: "AJ",
      },
      {
        id: "5",
        name: "Pat Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pat",
        initials: "PW",
      },
    ],
  },
  {
    id: "3",
    title: "GDPR Privacy Policy",
    description:
      "General Data Protection Regulation compliance documentation for EU data privacy requirements.",
    framework: "GDPR",
    lastUpdated: "1 week ago",
    progress: 90,
    collaborators: [
      {
        id: "2",
        name: "Maria Garcia",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        initials: "MG",
      },
      {
        id: "6",
        name: "Robin Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robin",
        initials: "RL",
      },
      {
        id: "7",
        name: "Jordan Patel",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
        initials: "JP",
      },
    ],
  },
  {
    id: "4",
    title: "ISO27001 Information Security",
    description:
      "International standard for information security management systems and risk assessment.",
    framework: "ISO27001",
    lastUpdated: "3 days ago",
    progress: 20,
    collaborators: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        initials: "AJ",
      },
      {
        id: "3",
        name: "Sam Taylor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
        initials: "ST",
      },
      {
        id: "8",
        name: "Casey Wong",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
        initials: "CW",
      },
    ],
  },
  {
    id: "5",
    title: "PCI-DSS Network Security",
    description:
      "Network security controls and documentation for PCI-DSS requirement 1 compliance.",
    framework: "PCI-DSS",
    lastUpdated: "Yesterday",
    progress: 60,
    collaborators: [
      {
        id: "4",
        name: "Jamie Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
        initials: "JS",
      },
      {
        id: "5",
        name: "Pat Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pat",
        initials: "PW",
      },
    ],
  },
  {
    id: "6",
    title: "GDPR Data Processing Agreement",
    description:
      "Legal agreement between data controller and processor defining responsibilities under GDPR.",
    framework: "GDPR",
    lastUpdated: "4 days ago",
    progress: 35,
    collaborators: [
      {
        id: "2",
        name: "Maria Garcia",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        initials: "MG",
      },
      {
        id: "6",
        name: "Robin Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robin",
        initials: "RL",
      },
      {
        id: "8",
        name: "Casey Wong",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
        initials: "CW",
      },
      {
        id: "9",
        name: "Taylor Reed",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
        initials: "TR",
      },
    ],
  },
];

export default DocumentGrid;
