import dotenv from 'dotenv';
import connectDB from './config/db';
import { seedDatabase } from './seeders/dataSeeder';
import { ensureAdminExists } from './seeders/adminSeeder';

dotenv.config();

const runSeed = async () => {
    try {
        await connectDB();
        await seedDatabase();
        await ensureAdminExists();
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
