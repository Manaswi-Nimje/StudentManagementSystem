# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
ARG API_URL=http://localhost:8080/api/students
COPY package*.json ./
RUN npm ci
COPY . .
RUN sed -i "s#apiUrl: '.*'#apiUrl: '${API_URL}'#" src/environments/environment.prod.ts
RUN npx ng build --configuration production

# ---- Serve stage ----
FROM nginx:alpine
COPY --from=build /app/dist/StudentProject/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
