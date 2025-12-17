import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('karetek_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for protected routes (not for chat)
    if (error.response?.status === 401 && !error.config.url.includes('/chat')) {
      localStorage.removeItem('karetek_token');
      localStorage.removeItem('karetek_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// ==================== PROFILE API ====================
export const profileAPI = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  }
};

// ==================== HEALTH METRICS API ====================
export const healthMetricsAPI = {
  getAll: async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get('/health-metrics', { params });
    return response.data;
  },

  add: async (metric) => {
    const response = await api.post('/health-metrics', metric);
    return response.data;
  },

  update: async (id, metric) => {
    const response = await api.put(`/health-metrics/${id}`, metric);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/health-metrics/${id}`);
    return response.data;
  }
};

// ==================== CHAT API ====================
export const chatAPI = {
  sendMessage: async (messages, language, sessionId) => {
    const response = await api.post('/chat', { messages, language, sessionId });
    return response.data;
  },

  translate: async (messages, targetLanguage) => {
    const response = await api.post('/chat/translate', { messages, targetLanguage });
    return response.data;
  }
};

// ==================== CONSULTATIONS API ====================
export const consultationsAPI = {
  getAll: async (limit = 20) => {
    const response = await api.get('/consultations', { params: { limit } });
    return response.data;
  }
};

// ==================== HEALTH RECORDS API ====================
export const healthRecordsAPI = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data.profile;
  },

  addMedication: async (medication) => {
    // Get current profile
    const profile = await profileAPI.get();
    const currentMedications = profile.current_medications || [];
    
    // Parse existing medications if they are strings
    const parsedMedications = currentMedications.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    // Add new medication
    const updatedMedications = [...parsedMedications, medication];
    
    // Stringify for database storage
    const stringifiedMedications = updatedMedications.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    // Update profile
    await profileAPI.update({ currentMedications: stringifiedMedications });
    return { medication: medication };
  },

  addAllergy: async (allergy) => {
    // Get current profile
    const profile = await profileAPI.get();
    const currentAllergies = profile.allergies || [];
    
    // Parse existing allergies if they are strings
    const parsedAllergies = currentAllergies.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    // Add new allergy
    const updatedAllergies = [...parsedAllergies, allergy];
    
    // Stringify for database storage
    const stringifiedAllergies = updatedAllergies.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    // Update profile
    await profileAPI.update({ allergies: stringifiedAllergies });
    return { allergy: allergy };
  },

  addCondition: async (condition) => {
    // Get current profile
    const profile = await profileAPI.get();
    const currentConditions = profile.medical_conditions || [];
    
    // Parse existing conditions if they are strings
    const parsedConditions = currentConditions.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    // Add new condition
    const updatedConditions = [...parsedConditions, condition];
    
    // Stringify for database storage
    const stringifiedConditions = updatedConditions.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    // Update profile
    await profileAPI.update({ medicalConditions: stringifiedConditions });
    return { condition: condition };
  },

  updateMedication: async (id, medication) => {
    const profile = await profileAPI.get();
    const currentMedications = profile.current_medications || [];
    
    const parsedMedications = currentMedications.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedMedications = parsedMedications.map(m => m.id === id ? medication : m);
    const stringifiedMedications = updatedMedications.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ currentMedications: stringifiedMedications });
    return { medication };
  },

  updateAllergy: async (id, allergy) => {
    const profile = await profileAPI.get();
    const currentAllergies = profile.allergies || [];
    
    const parsedAllergies = currentAllergies.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedAllergies = parsedAllergies.map(a => a.id === id ? allergy : a);
    const stringifiedAllergies = updatedAllergies.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ allergies: stringifiedAllergies });
    return { allergy };
  },

  updateCondition: async (id, condition) => {
    const profile = await profileAPI.get();
    const currentConditions = profile.medical_conditions || [];
    
    const parsedConditions = currentConditions.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedConditions = parsedConditions.map(c => c.id === id ? condition : c);
    const stringifiedConditions = updatedConditions.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ medicalConditions: stringifiedConditions });
    return { condition };
  },

  deleteMedication: async (id) => {
    const profile = await profileAPI.get();
    const currentMedications = profile.current_medications || [];
    
    const parsedMedications = currentMedications.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedMedications = parsedMedications.filter(m => m.id !== id);
    const stringifiedMedications = updatedMedications.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ currentMedications: stringifiedMedications });
    return { success: true };
  },

  deleteAllergy: async (id) => {
    const profile = await profileAPI.get();
    const currentAllergies = profile.allergies || [];
    
    const parsedAllergies = currentAllergies.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedAllergies = parsedAllergies.filter(a => a.id !== id);
    const stringifiedAllergies = updatedAllergies.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ allergies: stringifiedAllergies });
    return { success: true };
  },

  deleteCondition: async (id) => {
    const profile = await profileAPI.get();
    const currentConditions = profile.medical_conditions || [];
    
    const parsedConditions = currentConditions.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    
    const updatedConditions = parsedConditions.filter(c => c.id !== id);
    const stringifiedConditions = updatedConditions.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : item
    );
    
    await profileAPI.update({ medicalConditions: stringifiedConditions });
    return { success: true };
  }
};

// ==================== STATS API ====================
export const statsAPI = {
  get: async () => {
    const response = await api.get('/stats');
    return response.data;
  }
};

export default api;
