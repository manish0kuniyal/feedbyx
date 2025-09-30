// src/utils/helpers.js
// Convert Map-like or Mongoose Map to plain object safely
export function toPlainObject(maybeMap) {
  if (!maybeMap) return {};
  // If it's a Map instance
  if (maybeMap instanceof Map) {
    return Object.fromEntries(maybeMap);
  }
  // If it's an array of entries like [ [k,v], [k2,v2] ]
  if (Array.isArray(maybeMap)) {
    try {
      return Object.fromEntries(maybeMap);
    } catch {
      return {};
    }
  }
  // If it's already a plain object
  if (typeof maybeMap === 'object') {
    return maybeMap;
  }
  return {};
}

// small helper to safely read a nested field (optional)
export function safeGet(obj, path, fallback = undefined) {
  try {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? fallback;
  } catch {
    return fallback;
  }
}
