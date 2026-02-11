"use client";

import axios from 'axios';
import { getStoredToken } from './authStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error response
    if (error.response) {
      // Only log non-expected errors (not 400 for duplicate feedback, etc.)
      const isExpectedError = error.response.status === 400 && 
        (error.response.data?.message?.toLowerCase().includes("already") ||
         error.response.data?.data?.existing === true);
      
      if (!isExpectedError) {
        // Log the error for debugging (only if it's not an expected error)
        const logData = {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
        };
        
        // Only include data if it exists and has meaningful content
        if (error.response.data && Object.keys(error.response.data).length > 0) {
          logData.data = error.response.data;
        }
        
        console.error('API Error Response:', logData);
      }
      
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        (error.response.data?.success === false ? error.response.data.message : null) ||
        `Server error: ${error.response.status} ${error.response.statusText || 'Unknown error'}`;
      const errorObj = new Error(message);
      errorObj.response = error.response;
      return Promise.reject(errorObj);
    } else if (error.request) {
      console.error('API Request Error - No response:', {
        url: error.config?.url,
        message: error.message
      });
      const errorObj = new Error("Network error. Please check your connection.");
      errorObj.request = error.request;
      return Promise.reject(errorObj);
    } else {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  }
);

async function requestJSON(url, { method = "GET", body, headers = {}, ...options } = {}) {
  try {
    const response = await axiosInstance.request({
      url: url,
      method,
      data: body,
      headers: {
        ...headers,
      },
      ...options,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function postJSON(url, body, options = {}) {
  return requestJSON(url, { method: "POST", body, ...options });
}

export async function putJSON(url, body, options = {}) {
  return requestJSON(url, { method: "PUT", body, ...options });
}

export async function getJSON(url, options = {}) {
  return requestJSON(url, { method: "GET", ...options });
}

// Function for FormData uploads (for file uploads)
export async function postFormData(url, formData, options = {}) {
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Check if it's an expected error (like duplicate feedback)
      const isExpectedError = error.response.status === 400 && 
        (error.response.data?.message?.toLowerCase().includes("already") ||
         error.response.data?.data?.existing === true);
      
      // Only log unexpected errors
      if (!isExpectedError && error.response.data && Object.keys(error.response.data).length > 0) {
        console.error('FormData Upload Error:', {
          status: error.response.status,
          message: error.response.data?.message || error.response.data?.error,
          url: error.config?.url,
        });
      }
      
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        (error.response.data?.success === false ? error.response.data.message : null) ||
        "Something went wrong. Please try again.";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw error;
    }
  }
}

export async function putFormData(url, formData, options = {}) {
  try {
    const response = await axiosInstance.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        (error.response.data?.success === false ? error.response.data.message : null) ||
        "Something went wrong. Please try again.";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw error;
    }
  }
}

export async function deleteJSON(url, options = {}) {
  return requestJSON(url, { method: "DELETE", ...options });
}