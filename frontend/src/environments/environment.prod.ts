// Production build — swapped in via angular.json fileReplacements.
// Set this to your deployed backend's URL before building for production,
// or override at build time with:
//   ng build --configuration production --define "environment.apiBase='https://your-api.example.com/api'"
const apiBase = 'https://your-backend-domain.example.com/api';

export const environment = {
  production: true,
  apiBase,
  apiUrl: `${apiBase}/students`,
  authUrl: `${apiBase}/auth`,
};
