# Korean Wedding Invitation Web App

Mobile-first wedding invitation for **구은성 · 김예은**, built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

## What is implemented

- RSVP form with server validation
- Google Apps Script webhook forwarding for RSVP -> Google Sheets
- Guest photo upload with:
  - multiple image selection
  - client-side preview
  - upload progress
  - R2-compatible signed upload flow
  - optional DB-backed upload sessions and completion tracking
  - pending approval state (`pending / approved / rejected`)
- Mock upload provider for local development without storage setup
- Gallery, venue, calendar, and invitation sections

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Zod
- Cloudflare R2 + Supabase Postgres metadata table

## Environment variables

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Important variables:

- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`
  - required in production for RSVP delivery
  - optional in local development, where RSVP falls back to mock success
- `UPLOAD_PROVIDER`
  - use `s3` for Cloudflare R2 uploads
  - use `mock` for local development without storage setup
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
  - optional for DB-backed approval tracking

## Local development

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run test
npm run build
```

## RSVP setup

### 1. Create Google Apps Script webhook

Use a Google Sheet and attach an Apps Script Web App.

Example:

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
    data.submittedAt,
    data.source,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2. Deploy the Apps Script as a Web App

- Execute as: owner
- Access: whoever you intend to allow

### 3. Set the webhook URL

```bash
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/your-script-id/exec
```

Production behavior:

- missing webhook: RSVP fails
- webhook delivery failure: RSVP fails
- local development without webhook: RSVP succeeds in mock mode

## Cloudflare R2 upload setup

### 1. Create a private bucket in R2

Create a private bucket in Cloudflare R2:

- bucket name: match `S3_BUCKET`
- privacy: `private`
- recommended MIME restriction: `image/jpeg`, `image/png`, `image/webp`
- recommended file size limit: `12MB`

### 2. Create an R2 API token

Create a bucket-scoped token with `Object Read & Write`, then copy:

- `Account ID`
- `Access Key ID`
- `Secret Access Key`

Use the R2 S3 endpoint format:

```bash
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
```

### 3. Optional: apply the SQL migration

Run the migration in `supabase/migrations/202604181930_guest_photo_uploads.sql`.

This creates:

- `public.guest_photo_uploads`
- unique index on `storage_key`
- upload status and approval status constraints
- RLS enabled with no public policy

### 4. Configure environment variables

```bash
UPLOAD_PROVIDER=s3
S3_REGION=auto
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET=guest-uploads
S3_ACCESS_KEY_ID=your-r2-access-key-id
S3_SECRET_ACCESS_KEY=your-r2-secret-access-key

# Optional metadata persistence for upload sessions / approval state
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Deploy

Set the same environment variables in Vercel Project Settings.

## Upload architecture

The upload flow is:

1. `POST /api/uploads/presign`
2. Server validates file metadata
3. Server creates signed upload URLs
4. Browser uploads directly to Cloudflare R2
5. `POST /api/uploads/complete`
6. If Supabase metadata is configured, server marks matching rows as `uploaded + pending`

Notes:

- uploaded photos are not shown on the invitation site yet
- there is no admin UI in this phase
- approval is only persisted when Supabase metadata is configured
- R2 bucket CORS must allow your site origin for browser uploads
- `mock` provider remains available for local-only testing

## Approval operations

For this phase, approval is manual in Supabase Dashboard.

Recommended workflow:

- keep new uploads as `approval_status = pending`
- change to `approved` when ready for future publishing
- change to `rejected` if the file should not be used

No public gallery reads are wired to guest uploads in this phase.

## Tests

Automated coverage currently checks:

- RSVP normalization for non-attendance
- RSVP phone validation
- RSVP attendee count validation
- upload file-count, MIME, and size validation
- upload completion state transition
- upload completion idempotency
- missing upload session
- upload key mismatch

## Project structure

```txt
app/
  api/
    rsvp/route.ts
    uploads/
      presign/route.ts
      complete/route.ts
      mock/[key]/route.ts
components/
  sections/
lib/
  rsvp.ts
  validators.ts
  supabase/admin.ts
  upload/
    config.ts
    records.ts
    adapters/
supabase/
  migrations/
tests/
```
