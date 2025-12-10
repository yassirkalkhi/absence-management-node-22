export interface Class {
    _id: string;
    nom_classe: string;
    niveau: string;
    departement: string;
    filiere: string;
}

export interface Module {
    _id: string;
    nom_module: string;
    coefficient: number;
}

export interface Student {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    classe: Class | string;
    isActivated?: boolean;
}

export interface Teacher {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    classes: (Class | string)[];
}

export interface Session {
    _id: string;
    date_seance: string;
    heure_debut: string;
    heure_fin: string;
    enseignant: Teacher | string;
    module: Module | string;
    classe: Class | string;
}

export interface Absence {
    _id: string;
    etudiant: Student | string;
    seance: Session | string;
    statut: 'absent' | 'present' | 'retard';
    motif?: string;
}

export interface Justification {
    _id: string;
    absence: Absence | string;
    fichier: string;
    commentaire: string;
    etat: 'en attente' | 'validé' | 'refusé';
}

export interface User {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: 'student' | 'admin' | 'professor';
    etudiant?: string;
    enseignant?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface StudentActivationData {
    email: string;
    password: string;
    nom?: string;
    prenom?: string;
}

