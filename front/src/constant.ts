// Vite exposes environment variables via import.meta.env.
// Use a VITE_ prefixed variable (e.g. VITE_API_URL) or fall back to localhost.
export const backendURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:1234';