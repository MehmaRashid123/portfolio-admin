import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/lib/models';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const project = await Project.findById(params.id).lean();
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const project = await Project.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const project = await Project.findByIdAndDelete(params.id);
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
