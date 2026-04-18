import { GalleryPageClient } from "./gallery-page-client";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const language = params.lang === "en" ? "en" : "ko";

  return <GalleryPageClient language={language} />;
}
