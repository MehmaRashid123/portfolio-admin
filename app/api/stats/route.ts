import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project, Service, TeamMember, BlogPost } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const [projects, services, team, blog] = await Promise.all([
      Project.countDocuments(),
      Service.countDocuments(),
      TeamMember.countDocuments(),
      BlogPost.countDocuments(),
    ]);
    return NextResponse.json({ success: true, data: { projects, services, team, blog } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
