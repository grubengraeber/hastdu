# HastDu Deployment Guide

## Voraussetzungen

1. **PostgreSQL Datenbank** (z.B. über Coolify)
2. **Minio S3** für Bild-Uploads (z.B. über Coolify)
3. **Node.js 20+** oder Docker

## Umgebungsvariablen

Erstelle eine `.env` Datei mit folgenden Variablen:

```bash
# Database
DATABASE_URL=postgres://user:password@host:5432/hastdu

# JWT Secret (generieren mit: openssl rand -base64 32)
JWT_SECRET=dein-super-geheimes-jwt-secret

# Minio S3
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=dein-access-key
MINIO_SECRET_KEY=dein-secret-key
MINIO_BUCKET=hastdu-images
MINIO_USE_SSL=true

# Public URL für Bilder
NEXT_PUBLIC_IMAGE_BASE_URL=https://minio.example.com/hastdu-images

# App
NEXT_PUBLIC_APP_URL=https://hastdu.example.com
```

## Coolify Deployment

### 1. Postgres Service erstellen
- Gehe zu Coolify → Resources → + New
- Wähle PostgreSQL
- Konfiguriere Database Name: `hastdu`
- Notiere die Connection URL

### 2. Minio Service erstellen
- Gehe zu Coolify → Resources → + New
- Wähle Minio
- Konfiguriere:
  - Root User: `minioadmin`
  - Root Password: (generieren)
- Nach Start: Erstelle Bucket `hastdu-images` über Minio Console

### 3. Next.js App deployen
- Gehe zu Coolify → Resources → + New → Public Repository
- Repository: `https://github.com/grubengraeber/hastdu`
- Build Pack: Nixpacks (oder Dockerfile)
- Umgebungsvariablen hinzufügen (siehe oben)

### 4. Domain konfigurieren
- Unter Application Settings → Domain
- Füge Domain hinzu
- SSL-Zertifikat wird automatisch erstellt

## Datenbank Migration

Nach dem ersten Deployment:

```bash
# Lokal oder über Coolify Terminal
npx drizzle-kit push
```

## Admin User erstellen

Nach der ersten Registrierung, setze den User als Admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'dein@email.com';
```

## Features

- ✅ Basic Ad Management (CRUD, Bild-Upload)
- ✅ Search & Discovery (Feed, Filter nach Kategorie/Region)
- ✅ Identity & Security (JWT Auth, Session)
- ✅ Real-Time Chat (Basis-Implementation, WebSocket ready)
- ✅ Admin Moderation (Dashboard, Flag/Delete/Ban)

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL + Drizzle ORM
- Minio S3
- shadcn/ui (Nova Preset)
- Tailwind CSS 4
