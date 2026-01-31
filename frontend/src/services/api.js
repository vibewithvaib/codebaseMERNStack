import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Repository API
export const repositoryAPI = {
  getAll: () => api.get('/repositories'),
  getOne: (id) => api.get(`/repositories/${id}`),
  add: (data) => api.post('/repositories', data),
  delete: (id) => api.delete(`/repositories/${id}`),
  reanalyze: (id) => api.post(`/repositories/${id}/analyze`),
  getCommits: (id, page = 1) => api.get(`/repositories/${id}/commits?page=${page}`),
  getFiles: (id) => api.get(`/repositories/${id}/files`),
  getFileContent: (id, fileId) => api.get(`/repositories/${id}/files/${fileId}`),
  getFunctions: (id) => api.get(`/repositories/${id}/functions`),
  getGraph: (id, type = 'file') => api.get(`/repositories/${id}/graph?type=${type}`),
  getTimeline: (id) => api.get(`/repositories/${id}/timeline`)
};

// Question API
export const questionAPI = {
  ask: (repoId, question) => api.post(`/repositories/${repoId}/ask`, { question }),
  getHistory: (repoId) => api.get(`/repositories/${repoId}/questions`),
  getOne: (id) => api.get(`/questions/${id}`),
  getAll: () => api.get('/questions')
};

export default api;
