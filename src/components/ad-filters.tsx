'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CATEGORIES, REGIONS } from '@/lib/utils';
import { useCallback, useState, useTransition } from 'react';

interface AdFiltersProps {
  currentCategory?: string;
  currentRegion?: string;
  currentSearch?: string;
}

export function AdFilters({ currentCategory, currentRegion, currentSearch }: AdFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || '');

  const updateFilters = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset page when filters change
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [router, searchParams]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', search || null);
  }, [search, updateFilters]);

  const clearFilters = useCallback(() => {
    setSearch('');
    startTransition(() => {
      router.push('/');
    });
  }, [router]);

  const hasFilters = currentCategory || currentRegion || currentSearch;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <Input
          type="search"
          placeholder="Suche nach Produkten..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending}>
          Suchen
        </Button>
      </form>

      <div className="flex gap-2">
        <Select
          value={currentCategory || 'all'}
          onValueChange={(value) => updateFilters('category', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentRegion || 'all'}
          onValueChange={(value) => updateFilters('region', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Regionen</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
            Filter löschen
          </Button>
        )}
      </div>
    </div>
  );
}
