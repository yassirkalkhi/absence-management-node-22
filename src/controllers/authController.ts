import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Activate student account (for students created by admin)
export const activateStudentAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, nom, prenom } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis.' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ message: 'Un compte utilisateur existe déjà pour cet email.' });
            return;
        }

        // Find the student record by email
        const Etudiant = (await import('../models/Etudiant')).default;
        const etudiant = await Etudiant.findOne({ email: email.toLowerCase() });

        if (!etudiant) {
            res.status(404).json({
                message: 'Aucun étudiant trouvé avec cet email. Veuillez contacter l\'administrateur.'
            });
            return;
        }

        if (etudiant.isActivated) {
            res.status(400).json({
                message: 'Ce compte étudiant a déjà été activé. Veuillez vous connecter.'
            });
            return;
        }

        // Create user account linked to the student
        const user = new User({
            email: email.toLowerCase(),
            password,
            nom: nom || etudiant.nom,
            prenom: prenom || etudiant.prenom,
            role: 'student',
            etudiant: etudiant._id
        });

        await user.save();

        // Mark student as activated
        etudiant.isActivated = true;
        await etudiant.save();

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user data
        res.status(201).json({
            message: 'Compte étudiant activé avec succès.',
            token,
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                etudiant: user.etudiant
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'activation du compte:', error);
        res.status(500).json({ message: 'Erreur lors de l\'activation du compte.', error: (error as Error).message });
    }
};

// Register a new user (for admin accounts only)
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, nom, prenom, role } = req.body;

        // Only allow admin registration through this endpoint
        if (role && role !== 'admin') {
            res.status(400).json({
                message: 'Cet endpoint est réservé aux comptes administrateur. Les étudiants doivent utiliser /api/auth/activate-student.'
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
            return;
        }

        // Create new admin user
        const user = new User({
            email,
            password,
            nom,
            prenom,
            role: 'admin'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user data (without password)
        res.status(201).json({
            message: 'Administrateur créé avec succès.',
            token,
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: (error as Error).message });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis.' });
            return;
        }

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            return;
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user data (without password)
        res.status(200).json({
            message: 'Connexion réussie.',
            token,
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                etudiant: user.etudiant
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion.', error: (error as Error).message });
    }
};

 
