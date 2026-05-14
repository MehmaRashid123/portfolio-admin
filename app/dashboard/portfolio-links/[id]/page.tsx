'use client';

import PortfolioLinkForm from '../PortfolioLinkForm';

export default function EditPortfolioLinkPage({ params }: { params: { id: string } }) {
  return <PortfolioLinkForm linkId={params.id} />;
}
