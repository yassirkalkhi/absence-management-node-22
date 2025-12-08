import api from './api';
import type { Session } from '../types';

export const getAllSessions = async () => {
    const response = await api.get('/seances');
    return response.data;
};

export const createSession = async (data: Omit<Session, '_id'>) => {
    const response = await api.post('/seances', data);
    return response.data;
};

export const updateSession = async (id: string, data: Partial<Session>) => {
    const response = await api.put(`/seances/${id}`, data);
    return response.data;
};

export const deleteSession = async (id: string) => {
    const response = await api.delete(`/seances/${id}`);
    return response.data;
};
