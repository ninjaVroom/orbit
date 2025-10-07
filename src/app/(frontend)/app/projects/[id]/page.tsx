'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { clients, people, projects, type Status } from '@/lib/data';
import { date, dueLabel, first, person, time } from '@/lib/format';
import { moveError, progress, statusName, useStore } from '@/lib/store';
import { Board } from '@/components/screens';
import { Avatar, PriorityPill, useToast } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default function ProjectPage() {
  return <Suspense><Project /></Suspense>;
}

function Project() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { state } = useStore();
  const project = projects.find((p) => p.id === id);
  const [open, setOpenState] = useState(params.get('task'));
  if (!project) return <div className="empty"><h1>no such project</h1><Link href="/app/projects" className="btn btn--ghost">all projects</Link></div>;
  const c = clients.find((x) => x.id === project.clientId)!;
  const pct = progress(state, project.id);
  // Native history keeps the open task in the URL (shareable) without a route transition.
  const setOpen = (taskId: string | null) => {
    setOpenState(taskId);
    history.replaceState(null, '', taskId ? `?task=${taskId}` : location.pathname);
  };

  return (
    <div className="page page--wide">
      <header className="page-head">
        <div>
          <p className="muted small"><Link href="/app/projects">projects</Link> / {project.short.toLowerCase()}</p>
          <h1>{project.name}</h1>
          <p className="muted">{c.legal}, {c.city}. Due {date(project.due)}. {first(c.contactId)} signs off.</p>
        </div>
        <div className="head-progress">
          <span className="num big">{pct}%</span>
          <span className="bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></span>
        </div>
      </header>
      <p className="muted small board-hint">Drag cards between columns, or use each card’s menu. Cards waiting on {first(c.contactId)} can’t be marked done until the client approves.</p>
      <Board projectId={project.id} interactive onOpen={setOpen} />
      {open && <TaskDrawer taskId={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function TaskDrawer({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState('');
  const task = state.tasks.find((t) => t.id === taskId);
  // Closing is explicit (button, Esc, backdrop) and unmounts the dialog; no reliance on the close event.
  useEffect(() => { const d = ref.current!; if (!d.open) d.showModal(); }, []);
  if (!task) return null;
  const del = task.deliverableId && state.deliverables.find((d) => d.id === task.deliverableId);

  const setStatus = (to: Status) => {
    const err = moveError(state, task.id, to);
    if (err) { toast({ tone: 'error', text: err }); return; }
    dispatch({ type: 'move', taskId: task.id, to });
  };

  return (
    <dialog ref={ref} className="drawer" onCancel={(e) => { e.preventDefault(); onClose(); }} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="drawer-h">
      <div className="drawer-in">
        <header className="drawer-head">
          <h2 id="drawer-h">{task.title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </header>
        <dl className="drawer-facts">
          <div><dt>status</dt><dd>
            <select className="input input--sm" value={task.status} onChange={(e) => setStatus(e.target.value as Status)} aria-label="Status">
              {(['todo', 'progress', 'review', 'done'] as Status[]).map((s) => <option key={s} value={s}>{statusName[s]}</option>)}
            </select>
          </dd></div>
          <div><dt>priority</dt><dd><PriorityPill p={task.priority} /></dd></div>
          <div><dt>assignee</dt><dd><Avatar id={task.assignee} size={24} /> {person(task.assignee).name}</dd></div>
          <div><dt>due</dt><dd>{date(task.due)}, {dueLabel(task.due)}</dd></div>
          {del && <div><dt>in the portal</dt><dd>{del.title} v{del.version}, {del.state === 'waiting' ? 'waiting on the client' : del.state === 'approved' ? 'approved' : 'changes asked'}</dd></div>}
        </dl>
        <section className="thread" aria-labelledby="thread-h">
          <h3 id="thread-h">thread <span className="muted small">team only, unless marked</span></h3>
          <ol>
            {task.comments.map((c) => (
              <li key={c.id}>
                <Avatar id={c.by} size={28} />
                <div>
                  <p><strong>{person(c.by).name}</strong> <span className="muted small">{time(c.at)}</span> {c.shared && <span className="pill pill--soft">from the portal</span>}</p>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
            {!task.comments.length && <li className="muted">No comments yet.</li>}
          </ol>
          <form className="comment-form" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; dispatch({ type: 'comment', taskId, text: text.trim() }); setText(''); }}>
            <label className="visually-hidden" htmlFor="cmt">Add a comment</label>
            <input id="cmt" className="input" placeholder={`Comment as ${first(state.persona)}`} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn btn--primary btn--sm" disabled={!text.trim()}>post</button>
          </form>
        </section>
        <p className="muted small">Team on this project: {people.filter((p) => p.role !== 'client').map((p) => first(p.id)).join(', ')}.</p>
      </div>
    </dialog>
  );
}
