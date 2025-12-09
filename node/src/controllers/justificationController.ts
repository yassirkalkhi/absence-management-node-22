import { Request, Response } from 'express';
import Justification, { IJustification } from '../models/Justification';
import mongoose from 'mongoose';

export const createJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        const newJustification: IJustification = new Justification(req.body);
        const savedJustification = await newJustification.save();
        res.status(201).json(savedJustification);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getJustifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const justifications = await Justification.find().populate('absence');
        res.status(200).json(justifications);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getJustificationsByStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            res.status(400).json({ message: 'Invalid student id' });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(studentId);
 
        const pipeline = [
            {
                $lookup: {
                    from: 'absences',
                    localField: 'absence',
                    foreignField: '_id',
                    as: 'absence'
                }
            },
            { $unwind: { path: '$absence', preserveNullAndEmptyArrays: false } },
            { $match: { 'absence.etudiant': objectId } }
        ];

        const justifications = await Justification.aggregate(pipeline);

        res.status(200).json(justifications);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getJustificationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const justification = await Justification.findById(req.params.id).populate('absence');
        if (!justification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json(justification);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedJustification = await Justification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJustification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json(updatedJustification);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedJustification = await Justification.findByIdAndDelete(req.params.id);
        if (!deletedJustification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json({ message: 'Justification supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
