'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function NavBar({ signedIn }: { signedIn: boolean }) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        solid
          ? 'bg-bone/85 backdrop-blur-md border-b border-mist/40'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-content mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-t-22 tracking-[-0.01em] text-ink hover:text-accent transition-colors duration-500"
        >
          Sweet Pea
          <span className="text-ash italic font-light text-t-14 ml-1.5">photography</span>
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-t-12 uppercase tracking-[0.18em] text-ink">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-accent transition-colors duration-500"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-8">
          {signedIn ? (
            <Link
              href="/account"
              className="hidden sm:inline text-t-12 uppercase tracking-[0.18em] text-ink hover:text-accent transition-colors duration-500"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline text-t-12 uppercase tracking-[0.18em] text-ash hover:text-ink transition-colors duration-500"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/book"
            className="text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500"
          >
            Book
          </Link>
        </div>
      </nav>
    </header>
  );
}
