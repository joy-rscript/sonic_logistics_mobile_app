import axios from 'axios';

// API Configuration
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sonicafrica.com'; 
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, you'd get the token from secure storage or auth context
    const token = null; // Replace with actual token retrieval
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login
      console.warn('Unauthorized access - redirecting to login');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // Handle network errors - this is where we'll fall back to mock data
      console.warn('Network error - API may be unavailable:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;