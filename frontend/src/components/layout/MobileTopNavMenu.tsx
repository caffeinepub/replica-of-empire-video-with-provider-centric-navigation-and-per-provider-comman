import { Link } from '@tanstack/react-router';
import { Key, Wrench, Brain, Link as LinkIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function MobileTopNavMenu() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/vault', icon: Key, label: 'Vault' },
    { to: '/studio', icon: Wrench, label: 'Studio' },
    { to: '/memory', icon: Brain, label: 'Memory' },
    { to: '/links', icon: LinkIcon, label: 'Links' },
    { to: '/admin', icon: Shield, label: 'Admin' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.to}
                variant="ghost"
                className="justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link to={item.to}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
