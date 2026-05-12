/**
 * Seed script — creates the initial admin user
 * Run with: npx tsx scripts/seed.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agency-admin';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@agency.com' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  const password = await bcrypt.hash('admin123', 12);
  await User.create({
    name: 'Admin User',
    email: 'admin@agency.com',
    password,
    role: 'admin',
    isActive: true,
  });

  console.log('✓ Admin user created: admin@agency.com / admin123');
  console.log('  Change the password after first login!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
