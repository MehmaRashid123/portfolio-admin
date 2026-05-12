import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const hashed = await bcrypt.hash(body.password, 12);
    const user = await User.create({ ...body, password: hashed });
    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
