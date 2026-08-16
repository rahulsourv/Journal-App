import { TOKEN_KEY, USER_KEY, THEME_KEY } from "./constants";

/**
 * Thin, defensive wrapper around localStorage — Safari private mode and
 * disabled-storage settings both throw on access, and a journal app should
 * never white-screen because of that.
 */

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — fall through to in-memory session */
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export const getToken = () => safeGet(TOKEN_KEY);
export const setToken = (token) => safeSet(TOKEN_KEY, token);
export const clearToken = () => safeRemove(TOKEN_KEY);

export function getUser() {
  const raw = safeGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(USER_KEY);
    return null;
  }
}

export const setUser = (user) => safeSet(USER_KEY, JSON.stringify(user));
export const clearUser = () => safeRemove(USER_KEY);

export const getStoredTheme = () => safeGet(THEME_KEY);
export const setStoredTheme = (theme) => safeSet(THEME_KEY, theme);

export function clearSession() {
  clearToken();
  clearUser();
}
