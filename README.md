# K-pop Card Tracker

A web app for cataloging and tracking K-pop trading card (photocard) collections with flexible tagging, filtering, and search.

## Features

- Browse a gallery of card images in a uniform grid
- Tag cards with structured metadata: group, member, album, album version, year, card number, and custom tag types
- Filter by any combination of tags; search across tag names and notes
- Mark cards as **Collected** or **Wishlist**
- Upload single cards with a cropping tool (locked to the standard 55×85mm photocard ratio)
- Bulk import cards via a zip of images + JSON manifest
- Mobile-friendly and desktop layouts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Backend | C# .NET 8 Minimal API |
| ORM | Entity Framework Core 8 |
| Database | SQLite (local) → PostgreSQL (production) |
| Image storage | Local filesystem (local) → Azure Blob Storage (production) |

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- dotnet-ef tool: `dotnet tool install --global dotnet-ef --version "8.0.*"`

### Run the backend

```bash
cd backend
dotnet run
# API: http://localhost:5000
# Swagger UI opens automatically in Chrome
```

The SQLite database and migrations are applied automatically on first run.

### Run the frontend

```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

### Bulk import format

To import multiple cards at once, upload a `.zip` of images alongside a `.json` manifest:

```json
[
  {
    "imageFileName": "bts_jk_01.jpg",
    "officialCardNumber": "PC-01",
    "notes": "Holo version",
    "tags": [
      { "tagType": "Group", "name": "BTS" },
      { "tagType": "Member", "name": "Jungkook" },
      { "tagType": "Album", "name": "Map of the Soul: 7" },
      { "tagType": "Year", "name": "2020" }
    ]
  }
]
```

## Roadmap

- **Phase 2** — Host on Azure (App Service + PostgreSQL + Blob Storage)
- **Phase 3** — Google Auth + user accounts with personal collected/wishlist lists
- **Phase 4** — Community card submissions with admin approval queue

## Documentation

Full requirements, API contract, data model, and tech decisions are in [`CLAUDE.md`](./CLAUDE.md).
