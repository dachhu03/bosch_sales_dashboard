/**
 * Centralized API & Media Base URL Resolver
 * 
 * Automatically resolves the backend API target from Vite environment variables
 * with local development fallback (http://localhost:5000/api).
 */

// Dynamic API Base URL from environment variable or local default
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normalize trailing slashes to prevent malformed path joins
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

// Derive backend host origin (stripping trailing /api) for media static file serving
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Resolves static media URLs (such as product images) against the active backend origin.
 * Handles both relative paths ("/media/prod.jpg") and absolute URLs.
 * 
 * @param {string} path - Product image or media path
 * @returns {string} Fully qualified media URL
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? path : '/' + path}`;
};
