import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Etudiant from '../models/Etudiant'; 


const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }  
    );
};
 
export const activateStudentAccount = async (req: Request, res: Response): Promise<void> => {
  
    try {
        const { email, password} = req.body;
 
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis.' });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });  

        if (existingUser) {
            res.status(400).json({ message: 'Un compte utilisateur existe déjà pour cet email.' });
            return;
        }
        
  
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

        const user = new User({
            email: email.toLowerCase(),
            password,
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            role: 'student',
            etudiant: etudiant._id
        }); 
        await user.save();
        
       await Etudiant.updateOne(
        { _id: etudiant._id },
        { isActivated: true },
        { runValidators: false }
        );
        
        const token = generateToken(user._id.toString());

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
    } catch (error : any) { 
  
       res.status(200).json({ message: error.message });
    }
};
 
 
 
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
 
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis.' });
            return;
        }
 
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            return;
        }
 
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            return;
        }
 
        const token = generateToken(user._id.toString());
 
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
        res.status(402).json({ message: 'Erreur lors de la connexion.', error: (error as Error).message });
    }
};

 
