
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Barrow Market Place',
  description: 'Log in to your Barrow Market Place account.',
};

export default function LoginPage() {
  return (
      <LoginForm />
  );
}
