'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icons';
import { useAuth } from '../lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layers' },
  { href: '/tracks/modern-csharp', label: 'C#', icon: 'braces' },
  { href: '/tracks/aspnet-core', label: 'APIs', icon: 'server' },
  { href: '/tracks/ef-core', label: 'EF Core', icon: 'database' },
  { href: '/tracks/blazor', label: 'Blazor', icon: 'layers' },
  { href: '/capstones', label: 'Capstone Lab', icon: 'rocket' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-forge-border bg-forge-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-forge-brand to-forge-brand2 text-white">
            <Icon name="braces" size={18} />
          </span>
          <span className="text-lg">
            DotNet<span className="text-forge-brand2">Forge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-forge-panel2 text-white' : 'text-forge-muted hover:text-forge-text'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={logout} className="btn-ghost !px-3 text-xs" title="Sign out">
              <Icon name="user" size={16} />
              <span className="hidden sm:inline">{user.displayName}</span>
              <Icon name="logout" size={15} />
            </button>
          ) : (
            <Link href="/login" className="btn-primary !px-4 text-xs">
              <Icon name="user" size={15} /> Sign in
            </Link>
          )}
          <button
            className="btn-ghost !px-3 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-forge-border px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-forge-muted hover:bg-forge-panel2 hover:text-forge-text"
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
