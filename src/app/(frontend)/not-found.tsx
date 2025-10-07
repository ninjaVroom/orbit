import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/SiteChrome';

export default function NotFound() {
  return (
    <div className="site">
      <SiteNav />
      <main id="main" className="container notfound">
        <h1>this page left orbit</h1>
        <p className="lead muted">The link may be old, or the page was never built.</p>
        <div className="actions">
          <Link className="btn btn--primary" href="/">go home</Link>
          <Link className="btn btn--ghost" href="/login">open the demo</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
