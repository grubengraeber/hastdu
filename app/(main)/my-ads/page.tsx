import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getMyAds } from '@/actions/ads';
import { Header } from '@/components/header';
import { AdCard } from '@/components/ad-card';
import { Button } from '@/components/ui/button';

export default async function MyAdsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const ads = await getMyAds();

  return (
    <>
      <Header user={session} />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Meine Anzeigen</h1>
            <p className="text-muted-foreground">
              Verwalte deine aktiven Anzeigen
            </p>
          </div>
          <Button asChild>
            <Link href="/ads/new">Neue Anzeige</Link>
          </Button>
        </div>

        {ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Du hast noch keine Anzeigen erstellt
            </p>
            <Button asChild>
              <Link href="/ads/new">Erste Anzeige erstellen</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={{
                  ...ad,
                  user: { name: session.name },
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
