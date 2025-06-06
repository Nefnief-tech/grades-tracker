/**
 * Utility for managing API keys in cookies
 */

// Cookie functions
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
};

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// API Key Management
export const saveApiKey = (apiKeyName: string, apiKey: string, rememberKey: boolean = true) => {
  // Store in cookie (30 days if remember is true, session only if false)
  if (rememberKey) {
    setCookie(apiKeyName, apiKey, 30); // 30 days
  } else {
    setCookie(apiKeyName, apiKey, 0); // Session cookie
  }
};

export const getApiKey = (apiKeyName: string): string | null => {
  return getCookie(apiKeyName);
};

export const clearApiKey = (apiKeyName: string) => {
  eraseCookie(apiKeyName);
};

// Constants
export const API_KEY_NAMES = {
  GEMINI: 'gemini_api_key',
  OPENAI: 'openai_api_key'
};