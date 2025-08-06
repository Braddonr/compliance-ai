import React from "react";
import { motion } from "framer-motion";
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
  frameworks?: any[];
}

const ComplianceProgressTracker: React.FC<ComplianceProgressTrackerProps> = ({
  frameworks = [],
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
          {frameworks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No compliance data available</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {frameworks.map((progress, index) => (
                <motion.div
                  key={progress.framework?.id || index}
                  variants={itemVariants}
                  className="flex flex-col space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {progress.framework?.displayName || progress.framework?.name}
                    </h3>
                    <span className="text-sm font-medium">
                      {progress.completedTasks}/{progress.totalTasks} Tasks
                    </span>
                  </div>

                  <div className="relative pt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                      <Progress value={progress.progressPercentage} className="h-2" />
                    </motion.div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold inline-block text-primary">
                        {Math.round(progress.progressPercentage)}% Complete
                      </span>
                      <div className="flex items-center space-x-1">
                        {progress.progressPercentage === 100 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {progress.progressPercentage === 100
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
                    {progress.tasks && progress.tasks.length > 0 ? (
                      <ul className="space-y-2">
                        {progress.tasks
                          .filter((task: any) => task.priority === 'high' || task.priority === 'critical')
                          .slice(0, 3)
                          .map((task: any) => (
                            <motion.li
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors"
                            >
                              <span className="text-sm truncate flex-1 mr-2">{task.name}</span>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                {task.dueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </motion.li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No priority tasks
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceProgressTracker;
