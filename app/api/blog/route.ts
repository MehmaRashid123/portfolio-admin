import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const posts = await BlogPost.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: posts });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    // Auto-calculate read time
    if (body.content) {
      const words = body.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
      body.readTime = Math.ceil(words / 200);
    }
    const post = await BlogPost.create(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
