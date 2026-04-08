import axios from 'axios';
import { clearAuthSession, getAuthSession } from '../auth/authStorage';

// Instância base do Axios configurada para a Web API do .NET
const apiClient = axios.create({
  baseURL: 'http://localhost:5066/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthSession()?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratamento de erros genéricos e formatação de responses
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const apiMessage = error.response?.data?.mensagem || error.message;
    const validationErrors = error.response?.data?.erros;

    if (validationErrors) {
      console.error('API Validation Error:', apiMessage, validationErrors);
    } else {
      console.error('API Error:', apiMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
