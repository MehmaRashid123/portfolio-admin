import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project, Service, TeamMember, BlogPost, PortfolioLink } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const [projects, services, team, blog, portfolioLinks] = await Promise.all([
      Project.countDocuments(),
      Service.countDocuments(),
      TeamMember.countDocuments(),
      BlogPost.countDocuments(),
      PortfolioLink.countDocuments({ isActive: true }),
    ]);
    return NextResponse.json({ success: true, data: { projects, services, team, blog, portfolioLinks } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
