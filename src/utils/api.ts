import axios from 'axios';
import { API_URL } from './constants';
import { ApiResponse } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token and log requests
api.interceptors.request.use(
  (config) => {
    // Log request data
    console.log('Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });

    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log response data
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Transform error response to consistent format
    const errorResponse = {
      success: false,
      error: error.response?.data?.error || error.message || 'An unexpected error occurred'
    };

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(errorResponse);
  }
);

// Generic API functions
export const apiGet = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export const apiPost = async <T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export const apiPut = async <T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export const apiDelete = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.delete<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export default api;