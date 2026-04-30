'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-bone/90 backdrop-blur-sm border-b border-mist/60' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-t-18 tracking-tight text-ink hover:text-accent transition-colors"
        >
          Sweet Pea
        </Link>
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex items-center gap-8 text-t-14 text-ink">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/book"
            className="text-t-14 text-bone bg-ink px-4 py-2 hover:bg-accent transition-colors"
          >
            Book
          </Link>
        </div>
      </nav>
    </header>
  );
}
