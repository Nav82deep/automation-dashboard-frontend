import axios from 'axios';

// Use environment variable or default to localhost:5002
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pages API
export const pagesAPI = {
  getAll: () => api.get('/pages'),
  getOne: (pageId) => api.get(`/pages/${pageId}`),
  create: (data) => api.post('/pages', data),
  update: (pageId, data) => api.put(`/pages/${pageId}`, data),
  delete: (pageId) => api.delete(`/pages/${pageId}`),
  resetConsumedRows: (pageId) => api.post(`/pages/${pageId}/reset-consumed-rows`),
};

// Prompts API
export const promptsAPI = {
  getAll: () => api.get('/prompts'),
  getOne: (promptId) => api.get(`/prompts/${promptId}`),
  create: (data) => api.post('/prompts', data),
  update: (promptId, data) => api.put(`/prompts/${promptId}`, data),
  delete: (promptId) => api.delete(`/prompts/${promptId}`),
};

// Logs API
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getSummary: () => api.get('/logs/summary'),
};

// Automation API
export const automationAPI = {
  getStatus: () => api.get('/automation/status'),
  trigger: (pageId) => api.post('/automation/trigger', pageId ? { pageId } : {}),
  getExecutions: (limit) => api.get('/automation/executions', { params: { limit } }),
};

// Drive API
export const driveAPI = {
  getFolders: () => api.get('/drive/folders'),
};

export const manualAPI = {
  create: (data) => api.post('/manual-post', data), // Using axios 'api' instance which already has base path
};

export default api;

