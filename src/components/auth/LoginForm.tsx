'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess?: (user: any, token: string) => void;
  onLoginError?: (error: string) => void;
}

export function LoginForm({ onLoginSuccess, onLoginError }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        localStorage.setItem('auth_token', data.token);

        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorMessage = data.error || 'Invalid username or password. Please verify your credentials.';
        setError(errorMessage);
        onLoginError?.(errorMessage);
      }
    } catch {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      onLoginError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0d16] text-slate-100 p-4 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,114,182,0.16),rgba(56,189,248,0.06),rgba(10,13,22,0.92))]" />

      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-pink-500/25 bg-[#111626]/90 backdrop-blur-xl shadow-2xl shadow-black/40">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 flex items-center justify-center shadow-lg shadow-pink-500/20 text-[#0a0d16]">
            <Sparkles className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-200 via-rose-100 to-sky-200 bg-clip-text text-transparent">
            KOMMANDRA
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Dreamy Soft Aesthetic · Ruthlessly Functional Executive Suite
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-rose-500/15 border-rose-400/30 text-rose-200">
                <AlertDescription className="text-rose-200 text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-pink-100 text-xs font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-300/70" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 rounded-xl border-pink-500/20 focus:border-pink-400 bg-[#0a0d16]/90 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-pink-100 text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-300/70" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 rounded-xl border-pink-500/20 focus:border-pink-400 bg-[#0a0d16]/90 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="text-sm text-slate-300 bg-[#0d111d]/90 p-3 rounded-xl border border-pink-500/20 flex items-center justify-between">
              <div>
                <p className="font-semibold text-pink-200 text-xs mb-0.5">Executive Access</p>
                <p className="text-xs text-slate-400">Username: <code className="bg-pink-500/15 text-pink-200 px-1.5 py-0.5 rounded font-mono">admin</code></p>
                <p className="text-xs text-slate-400 mt-0.5">Password: <code className="bg-sky-500/15 text-sky-200 px-1.5 py-0.5 rounded font-mono">admin123</code></p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-xl border-pink-500/30 bg-[#111626] hover:bg-pink-500/20 text-pink-100"
                onClick={() => setFormData({ username: 'admin', password: 'admin123' })}
              >
                Auto-fill
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading || !formData.username || !formData.password}
              className="w-full h-11 bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:from-pink-300 hover:to-sky-200 text-[#0a0d16] font-bold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Enter KOMMANDRA Suite'
              )}
            </Button>
          </CardFooter>
        </form>

        <div className="text-center pb-6">
          <p className="text-[11px] text-slate-400">
            Zero-leakage sovereign executive authentication
          </p>
        </div>
      </Card>
    </div>
  );
}

export default LoginForm;
