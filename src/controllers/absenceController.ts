import { Request, Response } from 'express';
import Absence, { IAbsence } from '../models/Absence';

export const createAbsence = async (req: Request, res: Response): Promise<void> => {
    try {
        const newAbsence: IAbsence = new Absence(req.body);
        const savedAbsence = await newAbsence.save();
        res.status(201).json(savedAbsence);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getAbsences = async (req: Request, res: Response): Promise<void> => {
    try {
        const absences = await Absence.find()
            .populate('etudiant')
            .populate('seance');
        res.status(200).json(absences);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getAbsenceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const absence = await Absence.findById(req.params.id)
            .populate('etudiant')
            .populate('seance');
        if (!absence) {
            res.status(404).json({ message: 'Absence non trouvée' });
            return;
        }
        res.status(200).json(absence);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateAbsence = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedAbsence = await Absence.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAbsence) {
            res.status(404).json({ message: 'Absence non trouvée' });
            return;
        }
        res.status(200).json(updatedAbsence);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteAbsence = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedAbsence = await Absence.findByIdAndDelete(req.params.id);
        if (!deletedAbsence) {
            res.status(404).json({ message: 'Absence non trouvée' });
            return;
        }
        res.status(200).json({ message: 'Absence supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
