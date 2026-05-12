import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Testimonial } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: testimonials });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const testimonial = await Testimonial.create(body);
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create testimonial' }, { status: 500 });
  }
}
