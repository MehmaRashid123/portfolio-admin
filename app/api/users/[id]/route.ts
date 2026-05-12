import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    // Prevent password update through this route
    delete body.password;
    const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password');
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    // Prevent self-deletion
    if ((session?.user as any)?.id === params.id) {
      return NextResponse.json({ success: false, error: 'Cannot delete yourself' }, { status: 400 });
    }
    await connectDB();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
