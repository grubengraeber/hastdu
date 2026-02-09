import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, REGIONS } from '@/lib/utils';
import { ProfileForm } from '@/components/profile-form';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const regionLabel = user.region 
    ? REGIONS.find(r => r.value === user.region)?.label 
    : null;

  return (
    <>
      <Header user={session} />
      <main className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Mein Profil</h1>

        <div className="space-y-6">
          {/* Profile overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    {regionLabel && <Badge variant="outline">{regionLabel}</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mitglied seit {formatDate(user.createdAt)}
              </p>
            </CardContent>
          </Card>

          {/* Edit profile form */}
          <Card>
            <CardHeader>
              <CardTitle>Profil bearbeiten</CardTitle>
              <CardDescription>
                Aktualisiere deine persönlichen Informationen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
