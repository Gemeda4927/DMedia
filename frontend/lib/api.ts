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
};

export const newsApi = {
  getAll: (params?: any) => api.get('/news', { params }),
  getBySlug: (slug: string) => api.get(`/news/${slug}`),
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
  getContent: (params?: any) => api.get('/admin/content', { params }),
  approveContent: (id: string) => api.post(`/admin/content/${id}/approve`),
};

export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

export default api;

