import express from 'express';
import {  login, activateStudentAccount } from '../controllers/authController'; 

const router = express.Router();
   
router.post('/activate-student', activateStudentAccount); 
router.post('/login', login);
 

export default router;
