"use client";

export const TOKEN_STORAGE_KEY = "learninghubtoken";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const toStringId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }
  return null;
};

const sanitizeUser = (user = {}) => {
  if (!user) return null;
  return {
    id: toStringId(user.id || user._id || user.userId),
    fullName: user.fullName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
  };
};

export function persistAuthToken(token, user) {
  if (typeof window === "undefined" || !token) return;
  const payload = {
    token,
    user: sanitizeUser(user),
    expiresAt: Date.now() + SEVEN_DAYS_MS,
  };
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(payload));
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed.token;
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.user || !parsed?.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    const sanitizedUser = sanitizeUser(parsed.user);
    if (sanitizedUser?.id !== parsed.user?.id) {
      parsed.user = sanitizedUser;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(parsed));
    }
    return sanitizedUser;
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

export function updateStoredUser(partial = {}) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    parsed.user = sanitizeUser({ ...(parsed.user || {}), ...partial });
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

