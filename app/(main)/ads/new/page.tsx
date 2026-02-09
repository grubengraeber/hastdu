'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAd } from '@/actions/ads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, REGIONS } from '@/lib/utils';

export default function NewAdPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximal 5 Bilder erlaubt');
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Add images to form data
    images.forEach((image) => {
      formData.append('images', image);
    });

    const result = await createAd(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Neue Anzeige erstellen</CardTitle>
          <CardDescription>
            Beschreibe dein Produkt so detailliert wie möglich
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                name="title"
                placeholder="z.B. iPhone 15 Pro Max 256GB"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Beschreibe den Zustand, Funktionen, und was enthalten ist..."
                required
                minLength={20}
                maxLength={5000}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preis (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle eine Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select name="region" required>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle deine Region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bilder (max. 5)</Label>
              <div className="grid grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={preview}
                      alt={`Vorschau ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <span className="text-2xl text-muted-foreground">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Das erste Bild wird als Hauptbild verwendet
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Wird erstellt...' : 'Anzeige erstellen'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
