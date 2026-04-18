create table if not exists public.guest_photo_uploads (
  id uuid primary key,
  storage_provider text not null,
  storage_bucket text not null,
  storage_key text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  uploader_name text,
  upload_status text not null default 'presigned' check (upload_status in ('presigned', 'uploaded', 'failed')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  presigned_at timestamptz not null default now(),
  uploaded_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  constraint guest_photo_uploads_size_positive check (size_bytes > 0),
  constraint guest_photo_uploads_uploader_name_length check (uploader_name is null or char_length(uploader_name) <= 40)
);

create unique index if not exists guest_photo_uploads_storage_key_idx
  on public.guest_photo_uploads (storage_key);

create index if not exists guest_photo_uploads_upload_status_idx
  on public.guest_photo_uploads (upload_status, approval_status, presigned_at desc);

alter table public.guest_photo_uploads enable row level security;

comment on table public.guest_photo_uploads is 'Guest wedding photo uploads awaiting manual approval.';
