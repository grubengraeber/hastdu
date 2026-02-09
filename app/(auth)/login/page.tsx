'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-primary mb-2">
            HastDu
          </Link>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>
            Melde dich an, um Anzeigen zu erstellen und zu chatten
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="du@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Noch kein Konto?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Jetzt registrieren
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
