import { config } from '@/config';
import apiClient from '@/shared/services/ApiClient';
import type { Concept } from '@/shared/types/Concept';
import type { Page } from '@/shared/types/Pageble/Page';

const API_BASEPATH = new URL('/api/concepts', config.BACKEND_URL).toString();

export const conceptApi = {
  fetchConceptsByValueSetAndStatus: async (
    valueSetid: number,
    status: 'pending' | 'translated' | 'validated',
    page: number,
    size: number,
    sort: string,
    direction: 'asc' | 'desc',
  ): Promise<Page<Concept>> => {
    const response = await apiClient.get<Page<Concept>>(`${API_BASEPATH}/${valueSetid}/${status}`, {
      params: { page, size, sort, direction },
    });

    return response.data;
  },

  confirmManualTranslation: async (id: number, translation: string): Promise<void> => {
    await apiClient.patch(`${API_BASEPATH}/${id}/translation`, null, {
      params: { translation },
    });
  },

  confirmAutomaticTranslations: async (conceptids: number[]): Promise<void> => {
    await apiClient.post(`${API_BASEPATH}/translations/confirm`, conceptids);
  },

  validateTranslations: async (conceptids: number[]): Promise<void> => {
    await apiClient.post(`${API_BASEPATH}/translations/validate`, conceptids);
  },

  invalidateTranslations: async (conceptids: number[]): Promise<void> => {
    await apiClient.post(`${API_BASEPATH}/translations/invalidate`, conceptids);
  },
};
