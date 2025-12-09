import mongoose, { Schema, Document } from 'mongoose';
import { IClasse } from './Classe';

export interface IEtudiant extends Document {
    nom: string;
    prenom: string;
    email: string;
    classe: IClasse['_id'];
    isActivated: boolean; 
}

const EtudiantSchema: Schema = new Schema({
    nom: { type: String, required: [true, 'Le nom est requis'] },
    prenom: { type: String, required: [true, 'Le prénom est requis'] },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        lowercase: true,
        trim: true
    },
    classe: { type: mongoose.Schema.Types.ObjectId, ref: "Classe", required : false },
    isActivated: { type: Boolean, default: false } 
});

export default mongoose.model<IEtudiant>('Etudiant', EtudiantSchema);
