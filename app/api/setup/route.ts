import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// One-time setup route — creates first admin user
// DELETE this file after first use!
export async function GET() {
  try {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@agency.com' });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Admin already exists' });
    }

    const password = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Admin User',
      email: 'admin@agency.com',
      password,
      role: 'admin',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created!',
      credentials: {
        email: 'admin@agency.com',
        password: 'admin123',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
