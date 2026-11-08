import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('docvision_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Handle auth expired
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),

  // Documents
  getDocuments: (params?: any) => api.get('/documents', { params }),
  getDocument: (id: string) => api.get(`/documents/${id}`),
  uploadDocument: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  extractDocument: (id: string) => api.post(`/documents/${id}/extract`),

  // Validation
  runValidation: (data?: any) => api.post('/validation/run', data || {}),
  getValidationRuns: () => api.get('/validation/runs'),
  getValidationRun: (id: string) => api.get(`/validation/runs/${id}`),
  getFindings: () => api.get('/validation/findings'),
  updateFinding: (id: string, data: any) => api.patch(`/validation/findings/${id}`, data),

  // Relationships
  getRelationships: () => api.get('/relationships'),
  detectRelationships: () => api.post('/relationships/detect'),

  // Assistant & RAG
  queryAssistant: (question: string) => api.post('/assistant/query', { question }),
  semanticSearch: (q: string) => api.get('/assistant/search', { params: { q } }),

  // Workflow Review Queue
  getWorkflowTasks: () => api.get('/workflow/tasks'),
  submitTaskDecision: (taskId: string, decision: { action: string; comments?: string }) => 
    api.post(`/workflow/tasks/${taskId}/decision`, decision),

  // Reports
  getReports: () => api.get('/reports'),
  exportCsvUrl: '/api/reports/export-csv',

  // Dashboard Metrics
  getDashboardMetrics: () => api.get('/dashboard/metrics'),
};
