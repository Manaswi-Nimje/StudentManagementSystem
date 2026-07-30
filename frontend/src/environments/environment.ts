// Development defaults — used by `ng serve`.
const apiBase = 'http://localhost:8080/api';

export const environment = {
  production: false,
  apiBase,
  apiUrl: `${apiBase}/students`,
  authUrl: `${apiBase}/auth`,
};