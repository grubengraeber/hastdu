import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAdById } from '@/actions/ads';
import { getSession } from '@/actions/auth';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDate, formatRelativeTime, CATEGORIES, REGIONS } from '@/lib/utils';
import { ImageGallery } from '@/components/image-gallery';
import { ContactButton } from '@/components/contact-button';
import { DeleteAdButton } from '@/components/delete-ad-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  const ad = await getAdById(id);

  if (!ad || ad.status !== 'active') {
    notFound();
  }

  const categoryLabel = CATEGORIES.find(c => c.value === ad.category)?.label || ad.category;
  const regionLabel = REGIONS.find(r => r.value === ad.region)?.label || ad.region;
  const isOwner = session?.id === ad.userId;

  return (
    <>
      <Header user={session} />
      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <ImageGallery images={ad.images} title={ad.title} />

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{ad.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{categoryLabel}</Badge>
                      <Badge variant="outline">{regionLabel}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(ad.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ad.viewCount} Aufrufe
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Beschreibung</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {ad.description}
                </p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Erstellt am {formatDate(ad.createdAt)} ({formatRelativeTime(ad.createdAt)})
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verkäufer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ad.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {ad.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ad.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Mitglied seit {formatDate(ad.user.createdAt)}
                    </p>
                  </div>
                </div>

                {ad.user.region && (
                  <p className="text-sm">
                    📍 {REGIONS.find(r => r.value === ad.user.region)?.label}
                  </p>
                )}

                {!isOwner && session && (
                  <ContactButton adId={ad.id} />
                )}

                {!session && (
                  <Button asChild className="w-full">
                    <Link href="/login">Anmelden um zu kontaktieren</Link>
                  </Button>
                )}

                {isOwner && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Dies ist deine Anzeige
                    </p>
                    <DeleteAdButton adId={ad.id} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sicherheitshinweise</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Triff dich an öffentlichen Orten</p>
                <p>• Prüfe das Produkt vor dem Kauf</p>
                <p>• Zahle bar bei Abholung</p>
                <p>• Melde verdächtige Anzeigen</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
