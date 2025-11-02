import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
      // Clean the token - remove any extra whitespace or "Bearer " prefix
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
      
      // Log token info (first 20 chars and last 10 chars for debugging, not full token)
      const tokenPreview = cleanToken.length > 30 
        ? `${cleanToken.substring(0, 20)}...${cleanToken.substring(cleanToken.length - 10)}`
        : cleanToken;
      
      console.log('🟡 [API] Request interceptor - Token added to request:', {
        url: config.url,
        method: config.method,
        hasToken: !!cleanToken,
        tokenLength: cleanToken.length,
        tokenPreview: tokenPreview,
        headerValue: `Bearer ${cleanToken.substring(0, 20)}...`
      });
    } else {
      console.log('🟡 [API] Request interceptor - No token found:', {
        url: config.url,
        method: config.method
      });
    }
  }
  return config;
});

// Handle 401 errors - clear token and redirect to login
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response successful:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error) => {
    console.log('🔴 [API] Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message
    });

    if (error.response?.status === 401) {
      // Clear invalid token and auth state
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
        const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
        const isMeRequest = error.config?.url?.includes('/auth/me');
        
        console.log('🟡 [API] 401 error detected:', {
          currentPath,
          isAuthPage,
          isAuthRequest,
          isMeRequest,
          errorUrl: error.config?.url
        });
        
        // Don't clear state during login/register requests or on auth pages
        // Also don't clear on /auth/me if it's the first request after login
        if (!isAuthRequest && !isAuthPage && !isMeRequest) {
          console.log('🟡 [API] Clearing auth state and redirecting...');
          
          // Import store dynamically to avoid circular dependency
          const { useAuthStore } = await import('./store');
          useAuthStore.getState().logout();
          
          // Dispatch custom event to notify components of logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
          // Redirect to login
          if (window.location.pathname !== '/login') {
            console.log('🟡 [API] Redirecting to login');
            window.location.href = '/login';
          }
        } else {
          console.log('🟡 [API] Skipping auth clear - auth request/page or /me endpoint');
        }
      }
    }
    return Promise.reject(error);
  }
);

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
  // News management
  getNews: (params?: any) => api.get('/admin/news', { params }),
  getNewsById: (id: string) => api.get(`/admin/news/${id}`),
  approveNews: (id: string) => api.post(`/admin/news/${id}/approve`),
  rejectNews: (id: string, reason?: string) => api.post(`/admin/news/${id}/reject`, { reason }),
  publishNews: (id: string) => api.post(`/admin/news/${id}/publish`),
  updateNews: (id: string, data: any) => api.put(`/admin/news/${id}`, data),
  deleteNews: (id: string) => api.delete(`/admin/news/${id}`),
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

