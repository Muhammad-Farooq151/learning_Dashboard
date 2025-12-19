"use client";

async function requestJSON(url, { method = "GET", body, headers = {}, ...options } = {}) {
  const response = await fetch(url, {
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
      data?.error || data?.message || "Something went wrong. Please try again.";
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

