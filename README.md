# Korean Wedding Invitation Web App

Mobile-first premium wedding invitation for **구은성 · 김예은**, built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

## Features

- Korean / English language toggle (default: Korean, persisted in localStorage)
- Romantic, pastel, photo-centered mobile layout with subtle reveal animation
- Wedding info sections: hero, invitation message, details, calendar highlight, venue/map UI
- D-day countdown for `2026-06-06 12:00`
- Actions: copy address, Naver map, Kakao map
- RSVP form with server validation and Google Apps Script webhook integration point
- Guest photo upload with provider abstraction (mock / S3 / Supabase / Firebase)
- Presigned upload flow structure: `presign -> upload -> complete`
- Mood-based gallery sections with representative photos + horizontal scroll
- SEO/Open Graph metadata for sharing

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zod (server payload validation)

## Project Structure

```txt
app/
  api/
    rsvp/route.ts
    uploads/
      presign/route.ts
      complete/route.ts
      mock/[key]/route.ts
  layout.tsx
  page.tsx
  globals.css
components/
  wedding-invitation-page.tsx
  sections/
  ui/
content/
  invitation.ts
lib/
  date.ts
  photos.ts
  site-config.ts
  validators.ts
  upload/adapters/
types/
public/
  imgs/
  calendar/wedding-invitation.ics
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Important keys:

- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`: RSVP forwarding endpoint
- `UPLOAD_PROVIDER`: `mock | s3 | supabase | firebase`
- `NEXT_PUBLIC_SITE_URL`: production URL for share/metadata

## Local Development

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run start
```

## Google Sheets RSVP Integration

1. Open the provided spreadsheet and create an Apps Script project.
2. Add a `doPost(e)` handler that parses JSON and appends rows.
3. Deploy Apps Script as **Web App** (execute as owner, allow anyone with link if needed).
4. Put the deployed URL into `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`.

Minimal Apps Script example:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name,
    data.phone,
    data.side,
    data.attendance,
    data.attendeeCount,
    data.meal,
    data.message || "",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

## Photo Upload Storage Integration

### Current default

- `UPLOAD_PROVIDER=mock`
- Uses `/api/uploads/mock/[key]` to simulate direct upload

### Real provider wiring

Adapters are in:

- `lib/upload/adapters/s3.ts`
- `lib/upload/adapters/supabase.ts`
- `lib/upload/adapters/firebase.ts`

Each adapter currently contains explicit TODO comments for presigned URL/session generation.

Expected flow:

1. `POST /api/uploads/presign` returns upload targets
2. Client uploads directly to target URLs with progress UI
3. `POST /api/uploads/complete` stores metadata with `approvalStatus: "pending"`

This structure is ready for future admin moderation workflows.

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set all required environment variables in Vercel Project Settings.
4. Deploy.

## Notes

- Gallery uses all photos from `public/imgs` (hero/featured + masonry set)
- Reference screenshots are kept in `references/` for design tone exploration
