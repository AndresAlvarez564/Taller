import axios from 'axios';

const api = axios.create({
  baseURL: 'https://x4rtbi7bo4.execute-api.us-east-1.amazonaws.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
