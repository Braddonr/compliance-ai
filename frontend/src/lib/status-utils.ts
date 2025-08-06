/**
 * Utility functions for status formatting and styling
 */

export const formatStatus = (status: string): string => {
  switch (status) {
    case "in_review":
      return "In Review";
    case "draft":
      return "Draft";
    case "approved":
      return "Approved";
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const getDocumentStatusColor = (status: string): string => {
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

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};