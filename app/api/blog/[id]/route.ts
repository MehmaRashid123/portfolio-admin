import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/lib/models';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const post = await BlogPost.findById(params.id).lean();
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    if (body.content) {
      const words = body.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
      body.readTime = Math.ceil(words / 200);
    }
    const post = await BlogPost.findByIdAndUpdate(params.id, body, { new: true });
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const post = await BlogPost.findByIdAndDelete(params.id);
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}
