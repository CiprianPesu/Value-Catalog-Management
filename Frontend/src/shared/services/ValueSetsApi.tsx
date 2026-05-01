import type { ValueSet } from '@/shared/types/ValueSet';
import apiClient from './ApiClient';
import { config } from '@/config';

const BACKEND_URL: string = config.BACKEND_URL;

export const valueSetsApi = {
  getValueSetsByVersion: async (version: string): Promise<ValueSet[]> => {
    const res = await apiClient.get<ValueSet[]>(`${BACKEND_URL}/api/valueSets/mvcVersion/${version}`);
    return res.data;
  },

  getValueSetByid: async (id: string): Promise<ValueSet> => {
    const res = await apiClient.get<ValueSet>(`${BACKEND_URL}/api/valueSets/${id}`);
    return res.data;
  },
};
