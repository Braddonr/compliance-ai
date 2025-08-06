import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Clock,
  Target,
} from "lucide-react";
import { complianceAPI, usersAPI } from "@/lib/api";
import { formatStatus } from "@/lib/status-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "blocked"])
    .default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  dueDate: z.date().optional(),
  requirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
  frameworkId: z.string().min(1, "Framework is required"),
  complianceProgressId: z.string().optional(), // Made optional since we'll find it dynamically
  assignedToId: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  organizationId,
}) => {
  const [customRequirements, setCustomRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: "pending",
      priority: "medium",
      requirements: [],
    },
  });

  const watchedFramework = watch("frameworkId");

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ["frameworks"],
    queryFn: complianceAPI.getFrameworks,
  });

  // Fetch compliance progress
  const { data: complianceProgress } = useQuery({
    queryKey: ["compliance-progress"],
    queryFn: complianceAPI.getProgress,
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => complianceAPI.createTask(data),
    onSuccess: async (createdTask) => {
      console.log("Task created successfully:", createdTask);
      toast.success("Task created successfully!", { icon: "✅" });
      
      // Close modal first
      handleClose();
      
      // Add a small delay to ensure backend has updated compliance progress
      setTimeout(() => {
        // Invalidate and refetch compliance progress data
        queryClient.invalidateQueries({ queryKey: ["compliance-progress"] });
        queryClient.refetchQueries({ queryKey: ["compliance-progress"] });
      }, 500);
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    },
  });

  const handleClose = () => {
    reset();
    setCustomRequirements([]);
    setNewRequirement("");
    setSelectedDate(undefined);
    onClose();
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !customRequirements.includes(newRequirement.trim())
    ) {
      const updated = [...customRequirements, newRequirement.trim()];
      setCustomRequirements(updated);
      setValue("requirements", updated);
      setNewRequirement("");
    }
  };

  const removeRequirement = (requirement: string) => {
    const updated = customRequirements.filter((req) => req !== requirement);
    setCustomRequirements(updated);
    setValue("requirements", updated);
  };

  const onSubmit = (data: CreateTaskFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);

    // Find the compliance progress for the selected framework
    const selectedFramework = frameworks?.find(
      (f) => f.id === data.frameworkId
    );
    const progressForFramework = complianceProgress?.find(
      (progress: any) => progress.framework?.id === data.frameworkId
    );

    console.log("Selected framework:", selectedFramework);
    console.log("Progress for framework:", progressForFramework);

    if (!progressForFramework) {
      toast.error("Could not find compliance progress for selected framework");
      return;
    }

    const taskData = {
      name: data.name,
      description: data.description || "",
      status: data.status,
      priority: data.priority,
      dueDate: selectedDate?.toISOString(),
      requirements: data.requirements || [],
      notes: data.notes || "",
      frameworkId: data.frameworkId,
      complianceProgressId: progressForFramework.id,
      assignedToId: data.assignedToId || undefined,
    };

    console.log("Task data to be sent:", taskData);
    createMutation.mutate(taskData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-3 w-3" />;
      case "high":
        return <AlertTriangle className="h-3 w-3" />;
      case "medium":
        return <Clock className="h-3 w-3" />;
      case "low":
        return <Target className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <CheckSquare className="h-6 w-6" />
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Create a new compliance task and assign it to team members.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form wrapper */}
          <form
            onSubmit={(e) => {
              console.log("Form onSubmit triggered", e);
              handleSubmit(
                (data) => {
                  console.log(
                    "handleSubmit success, calling onSubmit with data:",
                    data
                  );
                  onSubmit(data);
                },
                (errors) => {
                  console.log("handleSubmit validation errors:", errors);
                }
              )(e);
            }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Task Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Implement Network Security Controls"
                      {...register("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework *</Label>
                    <Select
                      onValueChange={(value) => setValue("frameworkId", value)}
                    >
                      <SelectTrigger
                        className={errors.frameworkId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks?.map((framework: any) => (
                          <SelectItem key={framework.id} value={framework.id}>
                            {framework.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.frameworkId && (
                      <p className="text-sm text-red-500">
                        {errors.frameworkId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select
                      onValueChange={(value) => setValue("assignedToId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the task requirements and objectives"
                    {...register("description")}
                    rows={3}
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("status", value as any)
                      }
                      defaultValue="pending"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="in_progress">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-yellow-500" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-3 w-3 text-green-500" />
                            Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="blocked">
                          <div className="flex items-center gap-2">
                            <X className="h-3 w-3 text-gray-500" />
                            Blocked
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("priority", value as any)
                      }
                      defaultValue="medium"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="critical">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Critical
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add requirement"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addRequirement())
                      }
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {customRequirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customRequirements.map((req) => (
                        <Badge
                          key={req}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {req}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeRequirement(req)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes, context, or instructions for this task"
                    {...register("notes")}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 flex justify-end gap-2 flex-shrink-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                onClick={() => {
                  console.log("Create Task button clicked");
                  console.log("Current form values:", watch());
                  console.log("Form errors:", errors);
                  console.log("Is mutation pending:", createMutation.isPending);
                }}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
