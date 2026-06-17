export const API_BASE_URL = 'http://127.0.0.1:4300/api';

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
