import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

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
