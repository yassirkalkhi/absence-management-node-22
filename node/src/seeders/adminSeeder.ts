 import User from '../models/User';

export const ensureAdminExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = new User({
      email: adminEmail,
      password: adminPassword,
      nom: "admin",
      prenom: "system",
      role: "admin",
    });
    await admin.save();
  }
};
