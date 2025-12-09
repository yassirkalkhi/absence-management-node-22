import api from './api';
import type { Justification } from '../types';

export const getAllJustifications = async () => {
    const response = await api.get('/justifications');
    return response.data;
};

export const getStudentJustifications = async (studentId: string) => {
    const response = await api.get(`/justifications/student/${studentId}`);
    return response.data;
}


export const createJustification = async (data: Omit<Justification, '_id'>) => {
    const response = await api.post('/justifications', data);
    return response.data;
};

export const updateJustification = async (id: string, data: Partial<Justification>) => {
    const response = await api.put(`/justifications/${id}`, data);
    return response.data;
};

export const deleteJustification = async (id: string) => {
    const response = await api.delete(`/justifications/${id}`);
    return response.data;
};
