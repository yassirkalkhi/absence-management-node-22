import api from './api';
import type { Student } from '../types';

export const getAllStudents = async () => {
    const response = await api.get('/etudiants');
    return response.data;
};

export const createStudent = async (data: Omit<Student, '_id'>) => {
    const response = await api.post('/etudiants', data);
    return response.data;
};

export const updateStudent = async (id: string, data: Partial<Student>) => {
    const response = await api.put(`/etudiants/${id}`, data);
    return response.data;
};

export const deleteStudent = async (id: string) => {
    const response = await api.delete(`/etudiants/${id}`);
    return response.data;
};
