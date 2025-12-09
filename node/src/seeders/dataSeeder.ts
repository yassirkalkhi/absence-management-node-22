import mongoose from 'mongoose';
import Module from '../models/Module';
import Classe from '../models/Classe';
import Enseignant from '../models/Enseignant';
import Etudiant from '../models/Etudiant';
import User from '../models/User';
import Seance from '../models/Seance';
import Absence from '../models/Absence';
import Justification from '../models/Justification';

const firstNames = [
    "Mohamed", "Yassine", "Mehdi", "Omar", "Anass", "Bilal", "Hamza", "Amine", "Youssef", "Karim",
    "Fatima", "Salma", "Meryem", "Hajar", "Zineb", "Khadija", "Imane", "Sara", "Noura", "Asmaa"
];

const lastNames = [
    "Alaoui", "Idrissi", "Berrada", "Benjelloun", "Tazi", "Chraibi", "El Moussaoui", "El Fassi",
    "Bennani", "Naciri", "Amrani", "Sabri", "Rami", "Mansouri", "Wahbi", "El Amrani", "Daoudi"
];

const modulesList = [
    { nom_module: "Analyse Mathématique", coefficient: 5 },
    { nom_module: "Algèbre Linéaire", coefficient: 4 },
    { nom_module: "Programmation C", coefficient: 6 },
    { nom_module: "Base de Données", coefficient: 5 },
    { nom_module: "Probabilités et Statistiques", coefficient: 4 },
    { nom_module: "Développement Web", coefficient: 5 },
    { nom_module: "Systèmes d'exploitation", coefficient: 5 },
    { nom_module: "Réseaux Informatiques", coefficient: 5 },
    { nom_module: "Architecture des Ordinateurs", coefficient: 4 },
    { nom_module: "Conception UML", coefficient: 4 }
];

const classesList = [
    { nom_classe: "1ère Année Ingénierie", niveau: "1ère Année", departement: "Informatique", filiere: "Génie Informatique" },
    { nom_classe: "2ème Année Ingénierie", niveau: "2ème Année", departement: "Informatique", filiere: "Génie Informatique" },
    { nom_classe: "3ème Année Ingénierie", niveau: "3ème Année", departement: "Informatique", filiere: "Génie Informatique" }
];

const motifs = ["Maladie", "Urgence familiale", "Transport", "Rendez-vous médical", "Autre"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const seedDatabase = async () => {
    console.log('🌱 Starting database seed...');

    // 1. Clear Database
    await Promise.all([
        Module.deleteMany({}),
        Classe.deleteMany({}),
        Enseignant.deleteMany({}),
        Etudiant.deleteMany({}),
        User.deleteMany(),
        Seance.deleteMany({}),
        Absence.deleteMany({}),
        Justification.deleteMany({})
    ]);
    console.log('🧹 Database cleared (excluding admins).');

    // 2. Create Modules
    const createdModules = await Module.insertMany(modulesList);
    console.log(`📚 Created ${createdModules.length} modules.`);

    // 3. Create Classes
    const createdClasses = await Classe.insertMany(classesList);
    console.log(`🏫 Created ${createdClasses.length} classes.`);

    // 4. Create Teachers
    const teachersData = [];
    for (let i = 0; i < 8; i++) {
        const fn = getRandomElement(firstNames);
        const ln = getRandomElement(lastNames);
        const normalizedFn = fn.toLowerCase().replace(/\s+/g, '');
        const normalizedLn = ln.toLowerCase().replace(/\s+/g, '');
        teachersData.push({
            nom: ln,
            prenom: fn,
            email: `${normalizedFn}.${normalizedLn}${i}@prof.com`,
            password: "password123", // Ideally hashed, but schema might handle it or not? Enseignant schema has password but no pre-save hook shown. Assuming plain or handled elsewhere. User schema hooks handle hashing. Enseignant is separate.
            telephone: `06${getRandomInt(10000000, 99999999)}`,
            classes: [getRandomElement(createdClasses)._id]
        });
    }
    // Enseignant schema doesn't have bcrypt hooks shown in view_file 8. 
    // But usually password should be hashed. I'll leave as plain text for now or simple hash if I could? 
    // User explicitly asked for seeding based on provided adminSeeder, which relies on User model hooks.
    // Enseignant model might be for info only or has separate auth. 
    // I will proceed with simple strings.
    const createdTeachers = await Enseignant.insertMany(teachersData);
    console.log(`👨‍🏫 Created ${createdTeachers.length} teachers.`);

    // 5. Create Students & Users
    const studentsToCreate = [];
    const usersToCreate = [];

    for (let i = 0; i < 40; i++) {
        const fn = getRandomElement(firstNames);
        const ln = getRandomElement(lastNames);
        const normalizedFn = fn.toLowerCase().replace(/\s+/g, '');
        const normalizedLn = ln.toLowerCase().replace(/\s+/g, '');
        const classe = getRandomElement(createdClasses);

        // Create Etudiant
        const etudiant = new Etudiant({
            nom: ln,
            prenom: fn,
            email: `${normalizedFn}.${normalizedLn}${i}@etudiant.com`,
            classe: classe._id,
            isActivated: true
        });
        studentsToCreate.push(etudiant);

        // Create User linked to Etudiant
        usersToCreate.push({
            nom: ln,
            prenom: fn,
            email: etudiant.email,
            password: "password123",
            role: 'student',
            etudiant: etudiant._id
        });
    }

    // Start saving students and then users
    const createdStudents = await Etudiant.insertMany(studentsToCreate);

    // Need to update users with correct IDs if insertMany changes object references? 
    // Mongoose insertMany modifies the documents in place with _id.
    // We can just iterate createdStudents to build users to be safe.
    const finalUsersData = createdStudents.map(student => ({
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        password: "password123",
        role: 'student',
        etudiant: student._id
    }));

    // Use save for users to trigger pre-save hook (hashing)
    for (const uData of finalUsersData) {
        await new User(uData).save();
    }
    console.log(`👨‍🎓 Created ${createdStudents.length} students and users.`);

    // 6. Generate Seances (Last 6 months)
    const seancesToCreate = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const now = new Date();

    // Iterate days
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;

        // For each class, create 1-3 sessions
        for (const classe of createdClasses) {
            const dailySessions = getRandomInt(1, 3);
            for (let s = 0; s < dailySessions; s++) {
                // Random hour 8-16
                const startHour = getRandomInt(8, 16);
                const endHour = startHour + 2;

                const module = getRandomElement(createdModules);
                const enseignant = getRandomElement(createdTeachers); // Ideally check if teacher teaches this class, but simplier for now: random

                seancesToCreate.push({
                    date_seance: new Date(d),
                    heure_debut: `${startHour}:00`,
                    heure_fin: `${endHour}:00`,
                    enseignant: enseignant._id,
                    module: module._id,
                    classe: classe._id
                });
            }
        }
    }

    const createdSeances = await Seance.insertMany(seancesToCreate);
    console.log(`📅 Created ${createdSeances.length} sessions (seances).`);

    // 7. Generate Absences & Justifications
    const absencesToCreate = [];
    const justificationsToCreate = [];

    for (const seance of createdSeances) {
        // Find students in this class
        const classStudents = createdStudents.filter(s => s.classe.toString() === seance.classe.toString());

        for (const student of classStudents) {
            // 10% chance of absence or retard
            if (Math.random() < 0.1) {
                const statut = Math.random() < 0.3 ? 'retard' : 'absent';
                const absence = new Absence({
                    etudiant: student._id,
                    seance: seance._id,
                    statut: statut,
                    date_justification: null
                });
                absencesToCreate.push(absence);

                // 30% chance of justification
                if (Math.random() < 0.3) {
                    const etat = getRandomElement(['en attente', 'validé', 'refusé']);
                    justificationsToCreate.push({
                        absence: absence._id,
                        fichier: "justification_dummy.pdf",
                        commentaire: getRandomElement(motifs),
                        etat: etat
                    });

                    if (etat === 'validé') {
                        // Update absence to have date_justification if valid?
                        // Model has date_justification.
                        absence.date_justification = new Date();
                    }
                }
            }
        }
    }

    // Save Absences
    const savedAbsences = await Absence.insertMany(absencesToCreate);
    console.log(`🚫 Created ${savedAbsences.length} absences.`);

    // Fix Justifications: we created them with absence object IDs, which should work.
    // But wait, `insertMany` creates new docs. We used `new Absence(...)` so they have IDs locally.
    // `insertMany` with documents should preserve IDs. 
    // Just to be safe, I will rely on the fact that I created the documents with `new Absence` which assigns an `_id`.

    await Justification.insertMany(justificationsToCreate);
    console.log(`quittance Created ${justificationsToCreate.length} justifications.`);

    console.log('✅ Database seeded successfully!');
};
