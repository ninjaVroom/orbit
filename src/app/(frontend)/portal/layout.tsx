import type { Metadata } from 'next';
import { PortalShell } from '@/components/PortalShell';

export const metadata: Metadata = { title: 'client portal', robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
