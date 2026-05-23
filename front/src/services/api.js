import axios from "axios";

const API = axios.create({
  // '/api' is proxied to the backend by nginx (docker-compose) and nginx-ingress (Kubernetes)
  baseURL: "/api",
});

export default API;
