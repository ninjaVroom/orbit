import { SiteFooter, SiteNav } from '@/components/SiteChrome';
import { Motion } from '@/components/Motion';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <Motion />
    </div>
  );
}
