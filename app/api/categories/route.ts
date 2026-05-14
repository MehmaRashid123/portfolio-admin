import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/lib/models';

const DEFAULT_CATEGORIES = [
  { slug: 'graphic', label: 'Graphic Design', order: 0 },
  { slug: 'web', label: 'Web Development', order: 1 },
  { slug: '3d', label: '3D Art', order: 2 },
];

export async function GET() {
  try {
    await connectDB();
    let cats = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
    // Seed defaults if none exist
    if (cats.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      cats = await Category.find().sort({ order: 1 }).lean();
    }
    return NextResponse.json({ success: true, data: cats });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { label } = await req.json();
    if (!label?.trim()) {
      return NextResponse.json({ success: false, error: 'Label is required' }, { status: 400 });
    }
    const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Category already exists' }, { status: 400 });
    }
    const count = await Category.countDocuments();
    const cat = await Category.create({ slug, label: label.trim(), order: count });
    return NextResponse.json({ success: true, data: cat }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
