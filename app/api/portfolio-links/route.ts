import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PortfolioLink } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const links = await PortfolioLink.find()
      .populate('projects', 'title thumbnail category slug')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: links });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch portfolio links' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, slug, projects, isActive } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ success: false, error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
    }

    const existing = await PortfolioLink.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already taken' }, { status: 400 });
    }

    const link = await PortfolioLink.create({ title, slug, projects: projects || [], isActive: isActive ?? true });
    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already taken' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create portfolio link' }, { status: 500 });
  }
}
