import api from './api';
import type { Module } from '../types';

export const getAllModules = async () => {
    const response = await api.get('/modules');
    return response.data;
};

export const createModule = async (data: Omit<Module, '_id'>) => {
    const response = await api.post('/modules', data);
    return response.data;
};

export const updateModule = async (id: string, data: Partial<Module>) => {
    const response = await api.put(`/modules/${id}`, data);
    return response.data;
};

export const deleteModule = async (id: string) => {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
};
