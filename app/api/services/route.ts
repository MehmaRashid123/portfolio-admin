import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: services });
  } catch (err: any) {
    console.error('[GET /api/services]', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    // Generate slug from name
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Service.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A service with this name already exists' }, { status: 400 });
    }
    const service = await Service.create({
      name: name.trim(),
      slug,
      description: body.description || '',
      features: body.features || [],
      startingPrice: body.startingPrice || '',
      ctaLabel: body.ctaLabel || 'Get a Quote',
    });
    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/services]', err);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, error: 'A service with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { slug, _id, ...update } = body;

    // Find by _id if available, otherwise by slug
    const filter = _id ? { _id } : { slug };
    const service = await Service.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: service });
  } catch (err: any) {
    console.error('[PUT /api/services]', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update service' }, { status: 500 });
  }
}
