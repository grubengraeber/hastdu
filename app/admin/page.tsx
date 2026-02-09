import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getAllAds, getAllUsers, getModerationLog } from '@/actions/admin';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAdsTable } from '@/components/admin/ads-table';
import { AdminUsersTable } from '@/components/admin/users-table';
import { AdminLogTable } from '@/components/admin/log-table';

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/');
  }

  const [ads, users, logs] = await Promise.all([
    getAllAds(),
    getAllUsers(),
    getModerationLog(),
  ]);

  const stats = {
    totalAds: ads.length,
    flaggedAds: ads.filter(a => a.status === 'flagged').length,
    totalUsers: users.length,
    bannedUsers: users.filter(u => u.isBanned).length,
  };

  return (
    <>
      <Header user={session} />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anzeigen gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalAds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Markierte Anzeigen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-500">{stats.flaggedAds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Benutzer gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesperrte Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{stats.bannedUsers}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ads">
          <TabsList>
            <TabsTrigger value="ads">Anzeigen</TabsTrigger>
            <TabsTrigger value="users">Benutzer</TabsTrigger>
            <TabsTrigger value="logs">Aktivitätslog</TabsTrigger>
          </TabsList>
          <TabsContent value="ads" className="mt-4">
            <AdminAdsTable ads={ads} />
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <AdminUsersTable users={users} />
          </TabsContent>
          <TabsContent value="logs" className="mt-4">
            <AdminLogTable logs={logs} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
