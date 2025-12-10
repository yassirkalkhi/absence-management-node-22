import api from './api';
import type { Teacher } from '../types';

export const getAllTeachers = async () => {
    const response = await api.get('/enseignants');
    return response.data;
};

export const createTeacher = async (data: Omit<Teacher, '_id'>) => {
    const response = await api.post('/enseignants', data);
    return response.data;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>) => {
    const response = await api.put(`/enseignants/${id}`, data);
    return response.data;
};

export const deleteTeacher = async (id: string) => {
    const response = await api.delete(`/enseignants/${id}`);
    return response.data;
};

export const getEnseignantById = async (id: string) => {
    const response = await api.get(`/enseignants/${id}`);
    return response.data;
};
