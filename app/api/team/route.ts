import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const members = await TeamMember.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const member = await TeamMember.create(body);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create team member' }, { status: 500 });
  }
}
