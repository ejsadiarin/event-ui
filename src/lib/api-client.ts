import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { apiRequestDuration } from '@/lib/metrics';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptors to measure API call durations
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Add timing data to the request
    config.metadata = { startTime: Date.now() };

    // Add auth token (existing code)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // Calculate request duration if startTime was set
        if (response.config.metadata?.startTime) {
            const duration = (Date.now() - response.config.metadata.startTime) / 1000;
            const endpoint = response.config.url || 'unknown';
            const method = response.config.method || 'unknown';

            // Record the timing in the histogram
            apiRequestDuration.observe({ endpoint, method }, duration);
        }
        return response;
    },
    (error) => {
        // Still track timing for failed requests
        if (error.config?.metadata?.startTime) {
            const duration = (Date.now() - error.config.metadata.startTime) / 1000;
            const endpoint = error.config.url || 'unknown';
            const method = error.config.method || 'unknown';

            // Record the timing in the histogram
            apiRequestDuration.observe({ endpoint, method }, duration);
        }
        return Promise.reject(error);
    }
);

// API functions for auth
export const authAPI = {
    register: async (userData: { username: string; password: string; email: string }) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials: { username: string; password: string }) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return apiClient.post('/auth/logout');
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (profileData: { email?: string; display_picture?: string }) => {
        const response = await apiClient.put('/auth/profile', profileData);
        // Update stored user info
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            ...profileData
        }));
        return response.data;
    },

    changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
        const response = await apiClient.put('/auth/password', passwordData);
        return response.data;
    },

    deleteAccount: async () => {
        const response = await apiClient.delete('/auth/account');
        // Clear user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response.data;
    },
};

// API functions for events
export const eventsAPI = {
    getAllEvents: async () => {
        const response = await apiClient.get('/events');
        return response.data;
    },

    getEventById: async (id: number) => {
        const response = await apiClient.get(`/events/${id}`);
        return response.data;
    },

    registerForEvent: async (eventId: number) => {
        const response = await apiClient.post(`/events/${eventId}/register`);
        return response.data;
    },

    getUserRegistrations: async () => {
        const response = await apiClient.get('/events/user/registrations');
        return response.data;
    },

    checkRegistrationStatus: async (eventId: number) => {
        const response = await apiClient.get(`/events/${eventId}/check-registration`);
        return response.data;
    },

    getEventSlots: async (eventId?: number) => {
        const url = eventId ? `/events/${eventId}/slots` : '/events/slots';
        const response = await apiClient.get(url);
        return response.data;
    },

    createEvent: async (eventData: any) => {
        const response = await apiClient.post('/events', eventData);
        return response.data;
    },
};

// API functions for organizations
export const organizationsAPI = {
    getAllOrganizations: async () => {
        const response = await apiClient.get('/organizations');
        return response.data;
    },

    getOrganizationById: async (id: number) => {
        const response = await apiClient.get(`/organizations/${id}`);
        return response.data;
    },

    createOrganization: async (orgData: any) => {
        const response = await apiClient.post('/organizations', orgData);
        return response.data;
    },

    updateOrganization: async (id: number, orgData: any) => {
        const response = await apiClient.put(`/organizations/${id}`, orgData);
        return response.data;
    },
};
