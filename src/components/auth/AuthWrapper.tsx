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

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/demo'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

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
              document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
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
        let token: string | null = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token');
          if (!token) {
            const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
            if (match) {
              token = match[1];
              localStorage.setItem('auth_token', token);
            }
          }
        }

        if (!token) {
          await attemptTokenRefresh();
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

      } catch (error) {
        // Silently handle fetch or connection errors
        handleAuthFailure();
      }
    };

    if (isProtectedRoute) {
      checkAuth();
    } else {
      // Check auth state silently in background for public routes
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('auth_token');
      }
      if (token) {
        fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.ok ? res.json() : null)
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
      } else {
        setIsLoading(false);
      }
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
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch {
      // Ignore logout network error
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
      }
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  // For public routes, don't show loading or require auth
  if (!isProtectedRoute) {
    return (
      <div className="public-site">
        {/* Show user indicator for authenticated users on public pages */}
        {isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{user?.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-slate-600 dark:text-slate-400">Verifying authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated on protected route, show redirect message while effect handles navigation
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="authenticated-app">
      {/* Logout button in top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900 dark:text-slate-100">{user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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
