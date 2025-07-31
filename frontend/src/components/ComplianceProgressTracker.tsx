import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ComplianceFramework {
  name: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  priorityTasks: PriorityTask[];
}

interface PriorityTask {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
}

interface ComplianceProgressTrackerProps {
  frameworks?: ComplianceFramework[];
}

const ComplianceProgressTracker: React.FC<ComplianceProgressTrackerProps> = ({
  frameworks = [
    {
      name: "PCI-DSS",
      progress: 65,
      totalTasks: 40,
      completedTasks: 26,
      priorityTasks: [
        {
          id: "pci-1",
          name: "Network Security Controls",
          priority: "high",
          dueDate: "2023-07-15",
        },
        {
          id: "pci-2",
          name: "Access Control Measures",
          priority: "medium",
          dueDate: "2023-07-20",
        },
      ],
    },
    {
      name: "SOC2",
      progress: 42,
      totalTasks: 50,
      completedTasks: 21,
      priorityTasks: [
        {
          id: "soc-1",
          name: "Risk Assessment Documentation",
          priority: "high",
          dueDate: "2023-07-10",
        },
        {
          id: "soc-2",
          name: "Vendor Management Process",
          priority: "high",
          dueDate: "2023-07-18",
        },
      ],
    },
    {
      name: "GDPR",
      progress: 78,
      totalTasks: 35,
      completedTasks: 27,
      priorityTasks: [
        {
          id: "gdpr-1",
          name: "Data Processing Agreement",
          priority: "medium",
          dueDate: "2023-07-25",
        },
      ],
    },
  ],
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive bg-destructive/10 hover:bg-destructive/20";
      case "medium":
        return "text-yellow-600 bg-yellow-100 hover:bg-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 hover:bg-green-200";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="w-full bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Compliance Progress
          </CardTitle>
          <CardDescription>
            Track your progress across compliance frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <div key={framework.name} className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{framework.name}</h3>
                  <span className="text-sm font-medium">
                    {framework.completedTasks}/{framework.totalTasks} Tasks
                  </span>
                </div>

                <div className="relative pt-1">
                  <Progress value={framework.progress} className="h-2" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold inline-block text-primary">
                      {framework.progress}% Complete
                    </span>
                    <div className="flex items-center space-x-1">
                      {framework.progress === 100 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {framework.progress === 100
                          ? "Completed"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                    Priority Tasks
                  </h4>
                  {framework.priorityTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {framework.priorityTasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                          <span className="text-sm">{task.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No priority tasks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceProgressTracker;
