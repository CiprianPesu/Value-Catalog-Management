import { getKeycloakHolder } from '@/features/Auth/keycloakHolder';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const keycloak = getKeycloakHolder();

      if (keycloak?.token) {
        if (keycloak.isTokenExpired(30)) {
          await keycloak.updateToken(30);
        }

        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

export type ApiError = {
  status: number;
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export default apiClient;
