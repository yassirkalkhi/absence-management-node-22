import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}
 
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { 
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
            return;
        }
 
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
 
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ message: 'Token invalide.' });
            return;
        }
 
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};
 
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Non authentifié.' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
        return;
    }

    next();
};
 
export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Non authentifié.' });
        return;
    }

    if (req.user.role !== 'student') {
        res.status(403).json({ message: 'Accès refusé. Compte étudiant requis.' });
        return;
    }

    next();
};
 
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Non authentifié.' });
        return;
    }

    next();
};
