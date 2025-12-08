import express from 'express';
import { register, login, activateStudentAccount } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
 
router.post('/register', register); 
router.post('/activate-student', activateStudentAccount); 
router.post('/login', login);
 

export default router;
