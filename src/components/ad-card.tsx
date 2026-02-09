import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatRelativeTime, CATEGORIES, REGIONS } from '@/lib/utils';

interface AdCardProps {
  ad: {
    id: string;
    title: string;
    price: string;
    category: string;
    region: string;
    createdAt: Date;
    images: { url: string }[];
    user: { name: string };
  };
}

export function AdCard({ ad }: AdCardProps) {
  const categoryLabel = CATEGORIES.find(c => c.value === ad.category)?.label || ad.category;
  const regionLabel = REGIONS.find(r => r.value === ad.region)?.label || ad.region;
  const imageUrl = ad.images[0]?.url || '/placeholder.svg';

  return (
    <Link href={`/ads/${ad.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-square relative bg-muted">
          <Image
            src={imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{ad.title}</h3>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(ad.price)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Badge variant="secondary">{categoryLabel}</Badge>
          <Badge variant="outline">{regionLabel}</Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(ad.createdAt)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
