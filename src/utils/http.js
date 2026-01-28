"use client";

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error response
    if (error.response) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        (error.response.data?.success === false ? error.response.data.message : null) ||
        "Something went wrong. Please try again.";
      const errorObj = new Error(message);
      errorObj.response = error.response;
      return Promise.reject(errorObj);
    } else if (error.request) {
      const errorObj = new Error("Network error. Please check your connection.");
      errorObj.request = error.request;
      return Promise.reject(errorObj);
    } else {
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