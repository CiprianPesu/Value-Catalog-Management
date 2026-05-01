import { config } from '@/config';
import apiClient from './ApiClient';
import type { ValueCatalog } from '@/shared/types/ValueCatalog';
import type { ValueCatalogStats } from '@/shared/types/ValueCatalogStats';

const API_BASEPATH = new URL('/api/valueCatalog', config.BACKEND_URL).toString();

export const valueCatalogApi = {
  uploadFile: async ({
    file,
    version,
    jurisdictionId,
  }: {
    file: File;
    version: string;
    jurisdictionId: number;
  }): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);
    formData.append('jurisdictionId', jurisdictionId.toString());

    const response = await apiClient.post(`${API_BASEPATH}/upload`, formData);
    return response.data;
  },

  getAll: async (sort: string, direction: string): Promise<ValueCatalog[]> => {
    const res = await apiClient.get<ValueCatalog[]>(`${API_BASEPATH}`, { params: { sort, direction } });
    return res.data;
  },

  getVersionsStats: async (): Promise<ValueCatalogStats[]> => {
    const res = await apiClient.get<ValueCatalogStats[]>(`${API_BASEPATH}/stats`);
    return res.data;
  },

  getVersionStats: async (version: string): Promise<ValueCatalogStats> => {
    const res = await apiClient.get<ValueCatalogStats>(`${API_BASEPATH}/stats/${version}`);
    return res.data;
  },

  downloadFile: async (id: number, fileName: string) => {
    try {
      const response = await apiClient.get(`${API_BASEPATH}/download/${id}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error('Download error:', error);
      alert('Failed to download file.');
    }
  },

  downloadTranslatedFile: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_BASEPATH}/download/translated/${id}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `translated-mvc-${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error('Download error:', error);
      alert('Failed to download file.');
    }
  },
};
