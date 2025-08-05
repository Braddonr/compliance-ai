import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
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
    const response = await api.get('/compliance/frameworks');
    return response.data;
  },
  
  getProgress: async () => {
    const response = await api.get('/compliance/progress');
    return response.data;
  },
  
  getProgressByFramework: async (frameworkId: string) => {
    const response = await api.get(`/compliance/progress/${frameworkId}`);
    return response.data;
  },
  
  getPriorityTasks: async () => {
    const response = await api.get('/compliance/tasks/priority');
    return response.data;
  },
  
  createTask: async (taskData: any) => {
    const response = await api.post('/compliance/tasks', taskData);
    return response.data;
  },
  
  updateTask: async (id: string, taskData: any) => {
    const response = await api.patch(`/compliance/tasks/${id}`, taskData);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getAll: async (frameworkId?: string) => {
    const url = frameworkId ? `/documents?framework=${frameworkId}` : '/documents';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  
  create: async (documentData: any) => {
    const response = await api.post('/documents', documentData);
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
    const response = await api.post(`/documents/${documentId}/collaborators/${userId}`);
    return response.data;
  },
  
  removeCollaborator: async (documentId: string, userId: string) => {
    const response = await api.delete(`/documents/${documentId}/collaborators/${userId}`);
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateDocument: async (framework: string, requirements: string[]) => {
    const response = await api.post('/ai/generate-document', { framework, requirements });
    return response.data;
  },
  
  generateReport: async (reportData: {
    reportType: string;
    frameworks: string[];
    complianceData: any;
    includeCharts: boolean;
    includeRecommendations: boolean;
  }) => {
    const response = await api.post('/ai/generate-report', reportData);
    return response.data;
  },
  
  analyzeCompliance: async (analysisData: {
    currentState: any;
    targetFramework: string;
    organizationContext?: string;
  }) => {
    const response = await api.post('/ai/analyze-compliance', analysisData);
    return response.data;
  },
};