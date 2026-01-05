"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function requestJSON(url, { method = "GET", body, headers = {}, ...options } = {}) {
  // If URL starts with /api, use backend API URL, otherwise use relative URL
  const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url}` : url;
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // ignore json parse errors
  }

  if (!response.ok) {
    const message =
      data?.error || data?.message || data?.success === false ? data.message : "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
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

