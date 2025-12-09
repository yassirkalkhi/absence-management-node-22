import dotenv from 'dotenv';
import connectDB from './config/db';
import { seedDatabase } from './seeders/dataSeeder';
import { ensureAdminExists } from './seeders/adminSeeder';
import User from './models/User';

dotenv.config();

const runSeed = async () => {
    try {
        await connectDB();
         const alreadySeeded = await User.countDocuments();

        if (alreadySeeded > 0) {
            console.log("Database already seeded. Skipping..."); 
        }else{
            await seedDatabase();
        }


        await ensureAdminExists();
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
