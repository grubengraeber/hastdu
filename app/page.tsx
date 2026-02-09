import { getAds } from '@/actions/ads';
import { getSession } from '@/actions/auth';
import { Header } from '@/components/header';
import { AdCard } from '@/components/ad-card';
import { AdFilters } from '@/components/ad-filters';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    region?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();
  const ads = await getAds({
    category: params.category,
    region: params.region,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <>
      <Header user={session} />
      <main className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Technik Marktplatz</h1>
            <p className="text-muted-foreground">
              Finde die besten Deals für Technik-Produkte in deiner Nähe
            </p>
          </div>

          <Suspense fallback={<div>Lade Filter...</div>}>
            <AdFilters
              currentCategory={params.category}
              currentRegion={params.region}
              currentSearch={params.search}
            />
          </Suspense>

          {ads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Anzeigen gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
