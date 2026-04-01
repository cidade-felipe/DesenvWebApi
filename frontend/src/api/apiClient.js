import axios from 'axios';

// Instância base do Axios configurada para a Web API do .NET
const apiClient = axios.create({
  baseURL: 'http://localhost:5066/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros genéricos e formatação de responses
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data?.mensagem || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
