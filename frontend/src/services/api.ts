import axios from 'axios';

const api = axios.create({
  baseURL: 'https://x4rtbi7bo4.execute-api.us-east-1.amazonaws.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
