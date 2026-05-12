import TopBar from '@/components/layout/TopBar';
import BlogForm from '../BlogForm';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopBar title="Edit Post" />
      <BlogForm postId={params.id} />
    </>
  );
}
