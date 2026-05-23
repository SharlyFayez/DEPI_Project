FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Passed at build time so Vite bakes it into the static bundle.
# For Kubernetes / nginx-ingress use:  --build-arg VITE_API_URL=/api
# For docker-compose (default)      :  --build-arg VITE_API_URL=http://localhost:5000/api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Bake the nginx config into the image — no ConfigMap or volume mount needed in Kubernetes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80