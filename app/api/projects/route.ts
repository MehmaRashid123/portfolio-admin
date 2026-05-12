import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '100');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}
