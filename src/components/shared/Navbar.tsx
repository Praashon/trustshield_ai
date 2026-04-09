'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '/scan', label: 'Scanner' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'Learn' },
  { href: '/history', label: 'History' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname === link.href
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-[var(--amber)]/10 text-[var(--amber)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.display_name || user?.email}
              </span>
              <Button
                id="sign-out-button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90"
                >
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md px-2 h-9 border border-border bg-background hover:bg-accent transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === link.href
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-sm font-medium rounded-md text-[var(--amber)]"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-border pt-4 mt-2">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90">
                          Get started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
