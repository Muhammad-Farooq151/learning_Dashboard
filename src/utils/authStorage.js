"use client";

export const TOKEN_STORAGE_KEY = "learninghubtoken";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
    role: user.role || "user", // Include role in sanitized user
  };
};

export function persistAuthToken(token, user, rememberMe = true) {
  if (typeof window === "undefined" || !token) return;
  const sanitizedUser = sanitizeUser(user);
  // If rememberMe is true, save for 7 days, otherwise save for 1 day
  const expiresIn = rememberMe ? SEVEN_DAYS_MS : ONE_DAY_MS;
  const payload = {
    token,
    email: sanitizedUser?.email || user?.email || "",
    userId: sanitizedUser?.id || user?.id || user?._id || "",
    user: sanitizedUser,
    expiresAt: Date.now() + expiresIn,
    rememberMe: rememberMe,
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
    // Update email and userId if user data changed
    if (parsed.user) {
      parsed.email = parsed.user.email || parsed.email || "";
      parsed.userId = parsed.user.id || parsed.userId || "";
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * Get stored email from localStorage
 */
export function getStoredEmail() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed.email || parsed.user?.email || null;
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

/**
 * Get stored user ID from localStorage
 */
export function getStoredUserId() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed.userId || parsed.user?.id || null;
  } catch (error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

/**
 * Check if token is expired
 * @returns {boolean} true if token is expired or doesn't exist
 */
export function isTokenExpired() {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return true;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) {
      return true;
    }
    return Date.now() > parsed.expiresAt;
  } catch (error) {
    return true;
  }
}

/**
 * Check token and clear if expired
 * @returns {boolean} true if token is valid, false if expired
 */
export function checkTokenExpiry() {
  if (isTokenExpired()) {
    clearAuthToken();
    return false;
  }
  return true;
}

