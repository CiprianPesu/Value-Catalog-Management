import { config } from '@/config';
import apiClient from './ApiClient';
import type { Jurisdiction } from '../types/Jurisdiction';

const BACKEND_URL: string = config.BACKEND_URL;

export const jurisdictionApi = {
  getAll: async (): Promise<Jurisdiction[]> => {
    const res = await apiClient.get<Jurisdiction[]>(`${BACKEND_URL}/api/jurisdiction`);
    return res.data;
  },
};
