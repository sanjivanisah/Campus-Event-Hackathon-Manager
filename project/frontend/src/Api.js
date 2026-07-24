import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/'
});

api.interceptors.request.use((config) => {
  const publicEndpoints = [
    'token/',
    'token/refresh/',
    'accounts/register/',
    'accounts/google-auth/'
  ];
  const requestUrl = config.url || '';
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    requestUrl.endsWith(endpoint)
  );
  const token = localStorage.getItem('token');

  if (isPublicEndpoint) {
    delete config.headers.Authorization;
  } else if (token && token !== '[object Object]') {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
