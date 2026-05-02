'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createBrowserSupabase();
    let active = true;
    sb.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(!!data.user);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (active) setSignedIn(!!session?.user);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const navChip =
    'inline-flex min-h-[38px] items-center rounded-sm bg-bone px-3 text-[0.8rem] uppercase tracking-[0.19em] text-ink font-semibold hover:text-accent transition-colors duration-300';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstLink = panelRef.current?.querySelector<HTMLElement>('a, button');
    firstLink?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      toggleRef.current?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bone border-b border-mist">
      <nav className="max-w-content mx-auto px-6 h-[72px] md:h-20 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-[1.52rem] tracking-[-0.01em] text-ink hover:text-accent transition-colors duration-300 shrink-0 min-h-[44px] flex items-center bg-vellum px-3 rounded-sm"
        >
          Sweet Pea
          <span className="text-ash italic font-normal text-[0.97rem] ml-1.5">photography</span>
        </Link>

        <ul className="hidden md:flex items-center gap-3">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={navChip}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-3">
          {signedIn === null ? (
            <span aria-hidden className={`hidden sm:flex ${navChip} invisible`}>Account</span>
          ) : signedIn ? (
            <Link
              href="/account"
              className={`hidden sm:flex ${navChip}`}
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className={`hidden sm:flex ${navChip} text-ink/85`}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/book"
            className={`max-md:mr-1 ${navChip} bg-vellum`}
          >
            Book
          </Link>

          <button
            ref={toggleRef}
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
        ref={panelRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
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
              tabIndex={menuOpen ? 0 : -1}
              className="font-serif text-[clamp(1.5rem,5vw,2rem)] tracking-[-0.02em] text-ink py-3 border-b border-mist/80 hover:text-accent transition-colors duration-500"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-10 flex flex-col gap-6 pt-4">
            <Link
              href="/book"
              tabIndex={menuOpen ? 0 : -1}
              className="text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-2 self-start hover:text-accent hover:border-accent transition-colors duration-500"
            >
              See available dates →
            </Link>
            {signedIn === false && (
              <Link
                href="/login"
                tabIndex={menuOpen ? 0 : -1}
                className="text-t-14 text-ash hover:text-ink transition-colors duration-500 py-2"
              >
                Sign in
              </Link>
            )}
            {signedIn === true && (
              <Link
                href="/account"
                tabIndex={menuOpen ? 0 : -1}
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
