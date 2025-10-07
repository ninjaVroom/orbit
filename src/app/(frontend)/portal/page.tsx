'use client';
import { PortalHome } from '@/components/screens';
import { Icon } from '@/components/Icon';

const files = [
  { name: 'atlas-moodboard.pdf', size: '8.4 MB', on: 'Sept. 18' },
  { name: 'atlas-logo-routes-a-b-c.pdf', size: '14.2 MB', on: 'Oct. 9' },
  { name: 'atlas-colour-system.pdf', size: '3.1 MB', on: 'Oct. 23' },
];

export default function PortalOverview() {
  return (
    <div className="portal-page">
      <PortalHome clientId="atlas" />
      <section aria-labelledby="files-h">
        <h2 id="files-h" className="portal-sub">shared files</h2>
        <ul className="files">
          {files.map((f) => (
            <li key={f.name}>
              <Icon name="file" />
              <span>{f.name}<span className="muted small block">{f.size}, shared {f.on}</span></span>
              <button className="btn btn--ghost btn--sm" aria-disabled="true" title="Files aren’t downloadable in the demo">
                <Icon name="download" size={16} /> download
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
