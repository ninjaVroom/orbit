'use client';
// Scroll reveals and parallax. Content is visible without JS; the .js class (added here) opts in to
// the hidden-then-revealed states. Parallax and loops are skipped under reduced motion.
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Motion() {
  const path = usePathname();
  useEffect(() => {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect();

    // data-parallax="0.15": moves at 15% of scroll speed, relative to its parent's centre.
    const layers = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = innerHeight;
      for (const el of layers) {
        const r = el.parentElement!.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const off = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [path]);
  return null;
}
