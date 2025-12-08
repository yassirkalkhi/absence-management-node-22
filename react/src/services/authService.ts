import api from './api';
import type { AuthResponse, LoginCredentials, StudentActivationData } from '../types';

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

// Student activation
export const activateStudent = async (data: StudentActivationData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/activate-student', data);
    return response.data;
};

// Logout (client-side only)
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get stored token
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Get stored user
export const getStoredUser = (): any | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Store auth data
export const storeAuthData = (token: string, user: any): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};
