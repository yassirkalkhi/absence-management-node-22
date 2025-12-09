import api from './api';
import type { AuthResponse, LoginCredentials, StudentActivationData } from '../types';
 
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};
 
export const activateStudent = async (data: StudentActivationData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/activate-student', data);
    console.log(response.data);
    return response.data;
};
 
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
 
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};
 
export const getStoredUser = (): any | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
 
export const storeAuthData = (token: string, user: any): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};
 
export const isAuthenticated = (): boolean => {
    return !!getToken();
};
