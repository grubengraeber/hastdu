'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { logout } from '@/actions/auth';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Marktplatz' },
    { href: '/ads/new', label: 'Anzeige erstellen', auth: true },
    { href: '/my-ads', label: 'Meine Anzeigen', auth: true },
    { href: '/messages', label: 'Nachrichten', auth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.auth || user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">HastDu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-ads">Meine Anzeigen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">Nachrichten</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-4 mt-8">
                    {filteredNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-lg font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
