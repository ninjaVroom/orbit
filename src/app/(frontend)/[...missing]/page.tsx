import { notFound } from 'next/navigation';

// With two root layouts (the site and Payload's admin), unknown URLs need a route to reach not-found.
export default function Missing() {
  notFound();
}
