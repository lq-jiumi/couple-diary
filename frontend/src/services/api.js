import axios from 'axios';

const API_BASE_URL = 'https://couple-diary-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const coupleAPI = {
  getCoupleInfo: () => api.get('/couple'),
  createInviteCode: () => api.post('/couple/invite'),
  joinWithCode: (code) => api.post('/couple/join', { inviteCode: code }),
  unbindCouple: (confirm) => api.post('/couple/unbind', { confirm }),
  updateAnniversary: (anniversaries) => api.put('/couple/anniversary', { anniversaries }),
};

export const diaryAPI = {
  getEntries: (year, month) => api.get('/diary', { params: { year, month } }),
  getEntryByDate: (date) => api.get(`/diary/${date}`),
  createEntry: (data) => api.post('/diary', data),
  updateEntry: (date, data) => api.put(`/diary/${date}`, data),
  deleteEntry: (date) => api.delete(`/diary/${date}`),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (filename) => api.delete(`/upload/${filename}`),
};

export default api;
