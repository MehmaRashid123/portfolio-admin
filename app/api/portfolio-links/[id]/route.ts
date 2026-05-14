import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PortfolioLink } from '@/lib/models';

// GET by slug (PUBLIC) — used by frontend
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Try slug first (public access), then _id (admin access)
    let link = await PortfolioLink.findOne({ slug: params.id })
      .populate('projects', 'title thumbnail category slug shortDescription tags client year tools images')
      .lean();

    if (!link) {
      link = await PortfolioLink.findById(params.id)
        .populate('projects', 'title thumbnail category slug shortDescription tags client year tools images')
        .lean();
    }

    if (!link) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (!(link as any).isActive) {
      return NextResponse.json({ success: false, error: 'Link inactive', isActive: false }, { status: 410 });
    }

    // Increment view count
    await PortfolioLink.findByIdAndUpdate((link as any)._id, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: link });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch portfolio link' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json({ success: false, error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
    }

    // Check slug uniqueness (exclude current doc)
    if (body.slug) {
      const existing = await PortfolioLink.findOne({ slug: body.slug, _id: { $ne: params.id } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Slug already taken' }, { status: 400 });
      }
    }

    const link = await PortfolioLink.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
      .populate('projects', 'title thumbnail category slug');

    if (!link) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: link });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update portfolio link' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const link = await PortfolioLink.findByIdAndDelete(params.id);
    if (!link) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete portfolio link' }, { status: 500 });
  }
}
