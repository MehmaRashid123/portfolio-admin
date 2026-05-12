import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Testimonial } from '@/lib/models';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const t = await Testimonial.findById(params.id).lean();
    if (!t) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: t });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const t = await Testimonial.findByIdAndUpdate(params.id, body, { new: true });
    if (!t) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: t });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const t = await Testimonial.findByIdAndDelete(params.id);
    if (!t) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
