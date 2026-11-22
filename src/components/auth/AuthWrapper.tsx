'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  // Define protected routes that require authentication (exact '/' or prefix match for /dashboard, /demo)
  const isProtectedRoute = Boolean(
    pathname === '/' || pathname?.startsWith('/dashboard') || pathname?.startsWith('/demo')
  );

  useEffect(() => {
    let isMounted = true;

    const handleAuthFailure = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    const attemptTokenRefresh = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', data.token);
            }
            if (isMounted) {
              setUser(data.user);
              setIsAuthenticated(true);
              setIsLoading(false);
            }
            return;
          }
        }

        handleAuthFailure();
      } catch {
        handleAuthFailure();
      }
    };

    const checkAuth = async () => {
      setIsLoading(true);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/auth/me', {
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            if (isMounted) {
              setUser(data.user);
              setIsAuthenticated(true);
              setIsLoading(false);
            }
            return;
          }
        }

        await attemptTokenRefresh();
      } catch {
        handleAuthFailure();
      }
    };

    if (isProtectedRoute) {
      checkAuth();
    } else {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.success && data?.user && isMounted) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, isProtectedRoute]);

  // Handle client-side redirect for protected routes inside useEffect (never in render body)
  useEffect(() => {
    if (!isLoading && isProtectedRoute && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isProtectedRoute, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    } catch {
      // Ignore logout network error
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  // For public routes, don't show loading or require auth
  if (!isProtectedRoute) {
    return (
      <div className="public-site">
        {/* Show user indicator for authenticated users on public pages */}
        {isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-3 bg-[#111626]/90 backdrop-blur-md rounded-xl shadow-xl shadow-black/40 px-4 py-2 border border-pink-500/25">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 rounded-full flex items-center justify-center shadow-sm shadow-pink-500/20">
                  <User className="w-4 h-4 text-[#0a0d16]" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-100">{user?.username}</p>
                  <p className="text-xs text-pink-200/80 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-pink-100 hover:bg-pink-500/15 hover:text-pink-200"
              >
                Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-300 hover:bg-rose-500/15 hover:text-rose-300"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }

  // For protected routes, show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0d16] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_20%,rgba(244,114,182,0.14),rgba(56,189,248,0.06),transparent)]" />
        <div className="text-center relative z-10">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse">
            <Shield className="w-8 h-8 text-[#0a0d16]" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-pink-300" />
            <span className="text-pink-100/85 text-sm font-medium">Verifying authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated on protected route, show redirect message while effect handles navigation
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0d16] text-pink-100">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-pink-300" />
          <p className="text-sm text-slate-300">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="authenticated-app">
      {/* Logout button in top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-3 bg-[#111626]/90 backdrop-blur-md rounded-xl shadow-xl shadow-black/40 px-4 py-2 border border-pink-500/25">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 rounded-full flex items-center justify-center shadow-sm shadow-pink-500/20">
              <User className="w-4 h-4 text-[#0a0d16]" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-100">{user?.username}</p>
              <p className="text-xs text-pink-200/80 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-300 hover:bg-rose-500/15 hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="pb-4">
        {children}
      </div>
    </div>
  );
}

export default AuthWrapper;
