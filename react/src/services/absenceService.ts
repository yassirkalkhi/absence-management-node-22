import api from './api';
import type{ Absence } from '../types';

export const getAllAbsences = async () => {
    const response = await api.get('/absences');
    return response.data;
};

export const createAbsence = async (absence: Omit<Absence, '_id'>) => {
    const response = await api.post('/absences', absence);
    return response.data;
};

export const updateAbsence = async (id: string, data: Partial<Absence>) => {
    const response = await api.put(`/absences/${id}`, data);
    return response.data;
};

export const deleteAbsence = async (id: string) => {
    const response = await api.delete(`/absences/${id}`);
    return response.data;
};
