import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import classeRoutes from './routes/classeRoutes';
import moduleRoutes from './routes/moduleRoutes';
import etudiantRoutes from './routes/etudiantRoutes';
import enseignantRoutes from './routes/enseignantRoutes';
import seanceRoutes from './routes/seanceRoutes';
import absenceRoutes from './routes/absenceRoutes';
import justificationRoutes from './routes/justificationRoutes';
import authRoutes from './routes/authRoutes';
import { protect } from './middleware/authMiddleware';

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173','http://localhost'] }));

app.use('/api/classes', protect, classeRoutes);
app.use('/api/modules', protect, moduleRoutes);
app.use('/api/etudiants', protect, etudiantRoutes);
app.use('/api/enseignants', protect, enseignantRoutes);
app.use('/api/seances', protect, seanceRoutes);
app.use('/api/absences', protect, absenceRoutes);
app.use('/api/justifications', protect, justificationRoutes);
app.use('/api/auth', authRoutes);



app.get('/', (req: Request, res: Response) => {
    res.send('L\'API de gestion des absences est en cours d\'exécution...');
});

export default app;
