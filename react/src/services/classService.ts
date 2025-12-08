import api from './api';
import type { Class } from '../types';

export const getAllClasses = async () => {
    const response = await api.get('/classes');
    return response.data;
};

export const createClass = async (data: Omit<Class, '_id'>) => {
    const response = await api.post('/classes', data);
    return response.data;
};

export const updateClass = async (id: string, data: Partial<Class>) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
};

export const deleteClass = async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
};
