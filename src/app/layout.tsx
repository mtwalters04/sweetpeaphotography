import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Sweet Pea Photography',
  description: 'Portrait and event photography. Heirlooms, in modern light.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-bone text-ink">
        <main>{children}</main>
        <footer className="border-t border-mist mt-[clamp(96px,12vw,192px)]">
          <div className="max-w-content mx-auto px-6 py-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="font-serif text-t-22 tracking-tight">Sweet Pea Photography</div>
            <div className="text-ash text-t-14">
              © {new Date().getFullYear()} Sweet Pea Photography. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
