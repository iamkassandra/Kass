'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <LoginForm
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
