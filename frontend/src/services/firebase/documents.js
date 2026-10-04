import { api } from '../api';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const documentsService = {
  createDocument: async (projectId, documentData) => {
    try {
      const payload = {
        name: documentData.name,
        url: documentData.url || 'no-file-url',
        mimeType: documentData.type || 'application/octet-stream',
        sizeBytes: documentData.sizeBytes || 0,
      };
      
      const res = await api.post(`/projects/${projectId}/files`, payload);
      
      if (res.status === 'success') {
        return {
          id: res.data.id,
          name: res.data.name,
          url: res.data.url,
          size: documentData.size,
          sizeBytes: res.data.sizeBytes,
          uploadedBy: res.data.uploadedBy?.name || documentData.uploadedBy,
          date: 'Just now'
        };
      }
      return documentData;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  getProjectDocuments: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/files`);
      if (res.status === 'success') {
        return res.data.map(f => ({
          id: f.id,
          name: f.name,
          url: f.url,
          size: formatBytes(f.sizeBytes),
          sizeBytes: f.sizeBytes,
          uploadedBy: f.uploadedBy?.name || 'User',
          date: new Date(f.createdAt).toLocaleDateString()
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
};
