import TopBar from '@/components/layout/TopBar';
import ProjectForm from '../ProjectForm';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopBar title="Edit Project" />
      <ProjectForm projectId={params.id} />
    </>
  );
}
