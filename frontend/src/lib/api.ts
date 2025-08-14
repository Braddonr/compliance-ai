import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Debug environment variables in development
if (import.meta.env.DEV) {
  console.log("🔧 Frontend Environment Variables:");
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("All VITE_ vars:", Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
};

// Compliance API
export const complianceAPI = {
  getFrameworks: async () => {
    const response = await api.get("/compliance/frameworks");
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get("/compliance/progress");
    return response.data;
  },

  getProgressByFramework: async (frameworkId: string) => {
    const response = await api.get(`/compliance/progress/${frameworkId}`);
    return response.data;
  },

  getPriorityTasks: async () => {
    const response = await api.get("/compliance/tasks/priority");
    return response.data;
  },

  createTask: async (taskData: any) => {
    const response = await api.post("/compliance/tasks", taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await api.patch(`/compliance/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/compliance/tasks/${id}`);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getAll: async (frameworkId?: string) => {
    const url = frameworkId
      ? `/documents?framework=${frameworkId}`
      : "/documents";
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  create: async (documentData: any) => {
    const response = await api.post("/documents", documentData);
    return response.data;
  },

  update: async (id: string, documentData: any) => {
    const response = await api.patch(`/documents/${id}`, documentData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  getVersions: async (id: string) => {
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  addCollaborator: async (documentId: string, userId: string) => {
    const response = await api.post(
      `/documents/${documentId}/collaborators/${userId}`
    );
    return response.data;
  },

  removeCollaborator: async (documentId: string, userId: string) => {
    const response = await api.delete(
      `/documents/${documentId}/collaborators/${userId}`
    );
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getAll: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  getByCategory: async (category: string) => {
    const response = await api.get(`/settings/category/${category}`);
    return response.data;
  },

  getAISettings: async () => {
    const response = await api.get("/settings/ai");
    return response.data;
  },

  getByKey: async (key: string) => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  create: async (settingData: {
    key: string;
    value: string;
    description?: string;
    type?: "string" | "number" | "boolean" | "json";
    category?: string;
  }) => {
    const response = await api.post("/settings", settingData);
    return response.data;
  },

  update: async (
    key: string,
    updateData: {
      value?: string;
      description?: string;
      type?: "string" | "number" | "boolean" | "json";
      category?: string;
    }
  ) => {
    const response = await api.put(`/settings/${key}`, updateData);
    return response.data;
  },

  upsert: async (key: string, value: string, options?: any) => {
    const response = await api.post("/settings/upsert", {
      key,
      value,
      options,
    });
    return response.data;
  },

  delete: async (key: string) => {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  },

  getCompanyContext: async () => {
    const response = await api.get("/settings/ai/company-context");
    return response.data;
  },

  setCompanyContext: async (context: string) => {
    const response = await api.post("/settings/ai/company-context", {
      context,
    });
    return response.data;
  },

  initializeDefaults: async () => {
    const response = await api.post("/settings/initialize");
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateDocument: async (data: {
    framework: string;
    requirements: string[];
    title?: string;
    description?: string;
    companyContext?: string;
  }) => {
    const response = await api.post("/ai/generate-document", data);
    return response.data;
  },

  generateReport: async (reportData: {
    reportType: string;
    frameworks: string[];
    complianceData: any;
    includeCharts: boolean;
    includeRecommendations: boolean;
  }) => {
    const response = await api.post("/ai/generate-report", reportData);
    return response.data;
  },

  analyzeCompliance: async (analysisData: {
    currentState: any;
    targetFramework: string;
    organizationContext?: string;
  }) => {
    const response = await api.post("/ai/analyze-compliance", analysisData);
    return response.data;
  },
};
