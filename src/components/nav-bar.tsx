'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function NavBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        solid || menuOpen
          ? 'bg-bone/90 backdrop-blur-md border-b border-mist/50'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-content mx-auto px-6 h-[72px] md:h-20 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-t-22 tracking-[-0.01em] text-ink hover:text-accent transition-colors duration-500 shrink-0 min-h-[44px] flex items-center"
        >
          Sweet Pea
          <span className="text-ash italic font-light text-t-14 ml-1.5">photography</span>
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-t-12 uppercase tracking-[0.18em] text-ink">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-accent transition-colors duration-500 py-2"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-8">
          {signedIn ? (
            <Link
              href="/account"
              className="hidden sm:inline text-t-12 uppercase tracking-[0.18em] text-ink hover:text-accent transition-colors duration-500 py-2 min-h-[44px] flex items-center"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline text-t-12 uppercase tracking-[0.18em] text-ash hover:text-ink transition-colors duration-500 py-2 min-h-[44px] flex items-center"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/book"
            className="text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 min-h-[44px] flex items-end max-md:mr-1"
          >
            Book
          </Link>

          <button
            type="button"
            className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center text-ink hover:text-accent transition-colors duration-500 border border-mist rounded-sm bg-bone/50"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="relative block h-5 w-[22px]" aria-hidden>
              <span
                className={`absolute left-0 block h-px w-full bg-current transition duration-300 top-1/2 origin-center ${
                  menuOpen ? '-translate-y-1/2 rotate-45' : '-translate-y-[7px]'
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-current transition duration-300 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition duration-300 top-1/2 origin-center ${
                  menuOpen ? '-translate-y-1/2 -rotate-45' : 'translate-y-[6px]'
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav-panel"
        className={`md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-bone/98 backdrop-blur-lg border-t border-mist transition-[visibility,opacity] duration-300 ${
          menuOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif text-[clamp(1.5rem,5vw,2rem)] tracking-[-0.02em] text-ink py-3 border-b border-mist/80 hover:text-accent transition-colors duration-500"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-10 flex flex-col gap-6 pt-4">
            <Link
              href="/book"
              className="text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-2 self-start hover:text-accent hover:border-accent transition-colors duration-500"
            >
              See available dates →
            </Link>
            {!signedIn && (
              <Link
                href="/login"
                className="text-t-14 text-ash hover:text-ink transition-colors duration-500 py-2"
              >
                Sign in
              </Link>
            )}
            {signedIn && (
              <Link
                href="/account"
                className="text-t-14 text-ink hover:text-accent transition-colors duration-500 py-2"
              >
                Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
