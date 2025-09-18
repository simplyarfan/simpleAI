import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thesimpleai.vercel.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/cv-intelligence`,
  timeout: 300000, // 5 minutes for file processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔍 [INTERCEPTOR] Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔍 [INTERCEPTOR] Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
  } else {
    console.log('🔍 [INTERCEPTOR] No token found in localStorage');
  }
  console.log('🔍 [INTERCEPTOR] Final headers:', config.headers);
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('CV Intelligence API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const cvIntelligenceAPI = {
  // Create a new batch
  createBatch: async (batchName) => {
    try {
      console.log('🎯 Creating CV batch:', batchName);
      const response = await api.post('/batch', { batchName });
      return response;
    } catch (error) {
      console.error('Create batch error:', error);
      throw error;
    }
  },

  // Process files for a batch
  processFiles: async (batchId, jdFile, cvFiles, onProgress = null) => {
    try {
      console.log('📄 Processing files for batch:', batchId);
      console.log('📋 JD File:', jdFile?.name);
      console.log('📄 CV Files:', cvFiles?.map(f => f.name));

      const formData = new FormData();
      
      // Add JD file
      if (jdFile) {
        formData.append('jdFile', jdFile);
      }
      
      // Add CV files
      if (cvFiles && cvFiles.length > 0) {
        cvFiles.forEach((file) => {
          formData.append('cvFiles', file);
        });
      }

      const response = await api.post(`/batch/${batchId}/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response;
    } catch (error) {
      console.error('Process files error:', error);
      throw error;
    }
  },

  // Get all batches for the user
  getBatches: async () => {
    try {
      console.log('📊 Fetching user batches...');
      const response = await api.get('/batches');
      return response;
    } catch (error) {
      console.error('Get batches error:', error);
      throw error;
    }
  },

  // Get candidates for a specific batch
  getCandidates: async (batchId) => {
    try {
      console.log('👥 Fetching candidates for batch:', batchId);
      const response = await api.get(`/batch/${batchId}/candidates`);
      return response;
    } catch (error) {
      console.error('Get candidates error:', error);
      throw error;
    }
  },

  // Utility function to validate files
  validateFiles: (jdFile, cvFiles) => {
    const errors = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Validate JD file
    if (!jdFile) {
      errors.push('Job Description file is required');
    } else {
      if (jdFile.size > maxFileSize) {
        errors.push('Job Description file is too large (max 10MB)');
      }
      if (!allowedTypes.includes(jdFile.type)) {
        errors.push('Job Description must be PDF, TXT, DOC, or DOCX');
      }
    }

    // Validate CV files
    if (!cvFiles || cvFiles.length === 0) {
      errors.push('At least one CV file is required');
    } else if (cvFiles.length > 10) {
      errors.push('Maximum 10 CV files allowed');
    } else {
      cvFiles.forEach((file, index) => {
        if (file.size > maxFileSize) {
          errors.push(`CV file ${index + 1} is too large (max 10MB)`);
        }
        if (!allowedTypes.includes(file.type)) {
          errors.push(`CV file ${index + 1} must be PDF, TXT, DOC, or DOCX`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileIcon: (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  }
};

export default cvIntelligenceAPI;
