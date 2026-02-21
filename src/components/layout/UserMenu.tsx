'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export function UserMenu() {
  const { user } = useUserIdentity();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="User menu"
      >
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-emerald-700 font-bold text-sm flex items-center justify-center ring-2 ring-white/50 shadow-md">
          {initial}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-medium text-foreground truncate">{email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
