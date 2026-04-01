# K-pop Card Tracker

A web app for cataloging and tracking K-pop trading card collections with flexible tagging, filtering, and search.

---

## App Purpose & Goals

- Display and browse a large collection of K-pop trading card images
- Tag cards with structured metadata (group, member, album, version, year, card number, custom)
- Filter by any combination of tags; search by tag names or notes
- Mark cards as **Collected** or **Wishlist** (per user, eventually)
- Mobile-friendly and desktop browser views

### Future Goals
- Host on Azure; allow friends to create user profiles via Google Auth
- Community card submission with an approval queue
- Multi-user collection/wishlist tracking in the database

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite 5 | User preference; Vite 5 used for Node 20.15 compatibility |
| UI/Styling | Tailwind CSS v3 + shadcn/ui components | Mobile-first; accessible component primitives |
| Backend | C# .NET 8 Minimal API | User preference |
| ORM | Entity Framework Core 8 | Code-first migrations; easy SQLite → PostgreSQL swap |
| Database | SQLite (MVP) | Zero config local dev; swap connection string for production |
| Image storage | Local filesystem (MVP) | Files in `backend/wwwroot/images/`; served as static files |
| Future cloud | Azure App Service + Azure Blob Storage + Azure PostgreSQL | User's preferred cloud provider |
| Future auth | Google OAuth via ASP.NET Identity | Simplest account management for community users |

---

## Data Model

```
TagType
  Id (int, PK)
  Name (string)           — e.g., "Group", "Member", "Album", "Album Version", "Year", "Card Number"
  IsBuiltIn (bool)        — built-in types cannot be deleted

Tag
  Id (int, PK)
  Name (string)
  TagTypeId (int, FK → TagType)
  [unique index on (Name, TagTypeId)]

Card
  Id (Guid, PK)
  ImageFileName (string)  — stored file name (UUID-based), served from /images/
  OfficialCardNumber (string?)
  Notes (string?)
  CreatedAt (DateTime UTC)
  UpdatedAt (DateTime UTC)

CardTag  [junction]
  CardId (Guid, FK → Card)
  TagId (int, FK → Tag)
  [composite PK]
```

**Built-in TagTypes** (seeded): Group, Member, Album, Album Version, Year, Card Number

**Collection status** (MVP): stored in browser `localStorage` as two sets of card IDs (`kpop_collected`, `kpop_wishlist`). Will be promoted to a `UserCardStatus` DB table when user accounts are added.

---

## API Contract

Base URL: `http://localhost:5000` (dev)

### Cards

| Method | Path | Description |
|---|---|---|
| GET | `/api/cards` | List cards. Query: `search`, `tagIds` (comma-separated), `page`, `pageSize` |
| GET | `/api/cards/{id}` | Get card detail with all tags |
| POST | `/api/cards` | Create card. Multipart form: `image` (file), `officialCardNumber`, `notes`, `tagIds` (comma-separated) |
| PUT | `/api/cards/{id}` | Update card. JSON: `{ officialCardNumber, notes, tagIds[] }` |
| DELETE | `/api/cards/{id}` | Delete card and its image file |
| POST | `/api/cards/bulk-import` | Bulk import. Multipart form: `images` (zip file), `manifest` (JSON file) |

### Tags

| Method | Path | Description |
|---|---|---|
| GET | `/api/tags` | List all tags. Query: `tagTypeId` (optional filter) |
| POST | `/api/tags` | Create tag. JSON: `{ name, tagTypeId }` |
| DELETE | `/api/tags/{id}` | Delete tag |

### Tag Types

| Method | Path | Description |
|---|---|---|
| GET | `/api/tag-types` | List all tag types |
| POST | `/api/tag-types` | Create custom tag type. JSON: `{ name }` |
| DELETE | `/api/tag-types/{id}` | Delete custom tag type (built-in types cannot be deleted) |

### Bulk Import Manifest Format

```json
[
  {
    "imageFileName": "bts_jk_mots7_01.jpg",
    "officialCardNumber": "PC-01",
    "notes": "Holo version",
    "tags": [
      { "tagType": "Group", "name": "BTS" },
      { "tagType": "Member", "name": "Jungkook" },
      { "tagType": "Album", "name": "Map of the Soul: 7" },
      { "tagType": "Album Version", "name": "Version 1" },
      { "tagType": "Year", "name": "2020" }
    ]
  }
]
```

- `imageFileName`: must match the file name inside the zip
- `officialCardNumber` and `notes` are optional
- `tags` creates tag types and tags on the fly if they don't exist

---

## Project Structure

```
kpop-card-tracker/
├── CLAUDE.md                   ← this file
├── frontend/                   ← React + TypeScript + Vite
│   ├── .env                    ← VITE_API_URL
│   ├── src/
│   │   ├── api/                ← typed fetch wrappers (cards.ts, tags.ts, client.ts)
│   │   ├── components/
│   │   │   ├── cards/          ← CardGrid, CardTile, CardDetailModal
│   │   │   ├── filters/        ← FilterSidebar
│   │   │   ├── admin/          ← AdminUploadForm, BulkImportPanel
│   │   │   ├── layout/         ← Navbar
│   │   │   └── ui/             ← shadcn-style primitives (Button, Input, Dialog, Badge)
│   │   ├── hooks/              ← useCollection (localStorage)
│   │   ├── lib/                ← utils (cn, getImageUrl)
│   │   ├── pages/              ← GalleryPage, AdminPage
│   │   └── types/              ← TypeScript interfaces
└── backend/                    ← C# .NET 8 Minimal API
    ├── Data/                   ← AppDbContext, EF migrations
    ├── Models/                 ← Card, Tag, TagType, CardTag
    ├── Endpoints/              ← CardEndpoints, TagEndpoints, TagTypeEndpoints
    ├── Services/               ← ImageService
    ├── Migrations/
    └── wwwroot/images/         ← uploaded card images (gitignored)
```

---

## Local Dev Setup

### Prerequisites
- .NET 8 SDK
- Node.js 20+ (tested on 20.15)
- dotnet-ef tool: `dotnet tool install --global dotnet-ef --version "8.0.*"`

### Backend

```bash
cd backend
dotnet run
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
# DB auto-migrated on first run → kpop-cards.db
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI at http://localhost:5173
```

---

## Roadmap

### Phase 1 — MVP (current)
- [x] Card gallery with uniform grid
- [x] Tag-based filtering (multi-filter, any combination)
- [x] Full-text search
- [x] Card detail modal with edit + delete
- [x] Collected/Wishlist tracking via localStorage
- [x] Admin: single card upload with image + tag picker
- [x] Admin: bulk import via zip + JSON manifest
- [x] Mobile-responsive layout

### Phase 2 — Hosting
- [ ] Migrate SQLite → Azure PostgreSQL
- [ ] Migrate local image files → Azure Blob Storage
- [ ] Deploy backend to Azure App Service
- [ ] Deploy frontend to Azure Static Web Apps (or App Service)
- [ ] CI/CD pipeline

### Phase 3 — User Accounts
- [ ] Google OAuth integration
- [ ] User profiles: collected / wishlist stored in DB per user
- [ ] Migrate localStorage data to DB on first login

### Phase 4 — Community
- [ ] Card submission form (upload + tags) for community members
- [ ] Admin approval queue for submitted cards
- [ ] User-facing browse of pending/approved submissions
