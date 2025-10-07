'use client';
import { ReviewPanel } from '@/components/screens';
import { useStore } from '@/lib/store';

export default function Reviews() {
  const { state } = useStore();
  const mine = state.deliverables.filter((d) => d.projectId === 'atlas');
  return (
    <div className="portal-page">
      <h1 className="portal-h">reviews</h1>
      <p className="muted">Approve a version, or tell the team what to change. Every decision is kept with your name and the time.</p>
      {mine.map((d) => <ReviewPanel key={d.id} deliverableId={d.id} />)}
    </div>
  );
}
