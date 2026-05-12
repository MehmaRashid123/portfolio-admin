import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const member = await TeamMember.findById(params.id).lean();
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: member });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const member = await TeamMember.findByIdAndUpdate(params.id, body, { new: true });
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: member });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const member = await TeamMember.findByIdAndDelete(params.id);
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete member' }, { status: 500 });
  }
}
