import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const contentApi = {
  getAll: (params?: any) => api.get('/content', { params }),
  getById: (id: string) => api.get(`/content/${id}`),
  getEpisodes: (id: string) => api.get(`/content/${id}/episodes`),
  watch: (id: string) => api.get(`/content/${id}/watch`),
  create: (data: any) => api.post('/content', data),
  update: (id: string, data: any) => api.put(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
};

export const newsApi = {
  getAll: (params?: any) => api.get('/news', { params }),
  getBySlug: (slug: string) => api.get(`/news/${slug}`),
  getById: (id: string) => api.get(`/news/id/${id}`),
  create: (data: any) => api.post('/news', data),
  update: (id: string, data: any) => api.put(`/news/${id}`, data),
  delete: (id: string) => api.delete(`/news/${id}`),
};

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  create: (data: any) => api.post('/subscriptions', data),
  cancel: () => api.post('/subscriptions/cancel'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  addWatchHistory: (data: any) => api.post('/users/watch-history', data),
  addBookmark: (contentId: string) => api.post('/users/bookmarks', { contentId }),
  removeBookmark: (contentId: string) => api.delete(`/users/bookmarks/${contentId}`),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getContent: (params?: any) => api.get('/admin/content', { params }),
  approveContent: (id: string) => api.post(`/admin/content/${id}/approve`),
  rejectContent: (id: string, reason?: string) => api.post(`/admin/content/${id}/reject`, { reason }),
};

export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

export const youtubeApi = {
  fetchVideo: (url: string) => api.post('/youtube/fetch-video', { url }),
  importVideo: (data: any) => api.post('/youtube/import-video', data),
  search: (query: string, maxResults?: number) => api.get('/youtube/search', { params: { q: query, maxResults } }),
};

export default api;

