import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find().sort({ slug: 1 }).lean();
    return NextResponse.json({ success: true, data: services });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { slug, ...update } = body;
    const service = await Service.findOneAndUpdate(
      { slug },
      { ...update, slug },
      { new: true, upsert: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: service });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update service' }, { status: 500 });
  }
}
