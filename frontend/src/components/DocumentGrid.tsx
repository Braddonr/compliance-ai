import React from "react";
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
import { Clock, Download, FileText, MoreHorizontal, Users } from "lucide-react";
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
  documents?: Document[];
  onDocumentClick?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents = defaultDocuments,
  onDocumentClick = () => {},
  onDownload = () => {},
}) => {
  return (
    <div className="bg-background w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Documents</h2>
        <Button variant="outline">View All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onDocumentClick(doc.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge
                  variant={getBadgeVariant(doc.framework)}
                  className="mb-2"
                >
                  {doc.framework}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {doc.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(doc.progress)}`}
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>{doc.progress}% Complete</span>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{doc.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex -space-x-2">
                  <TooltipProvider>
                    {doc.collaborators.slice(0, 3).map((collaborator) => (
                      <Tooltip key={collaborator.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-7 w-7 border-2 border-background">
                            {collaborator.avatar && (
                              <AvatarImage
                                src={collaborator.avatar}
                                alt={collaborator.name}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {collaborator.initials}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{collaborator.name}</p>
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
                  </TooltipProvider>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{doc.collaborators.length} collaborators</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
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
