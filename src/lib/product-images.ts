import monolith from "@/assets/frame-monolith.jpg";
import whisper from "@/assets/frame-whisper.jpg";
import oak from "@/assets/frame-oak.jpg";
import brass from "@/assets/frame-brass.jpg";
import trio from "@/assets/frame-trio.jpg";
import baroque from "@/assets/frame-baroque.jpg";
import hero from "@/assets/hero-gallery.jpg";

const assetMap: Record<string, string> = {
  monolith,
  whisper,
  oak,
  brass,
  trio,
  baroque,
  hero,
};

/**
 * Resolves a stored image_url into a usable URL.
 * - "asset:<key>" → bundled Vite asset
 * - http(s) URL → returned as-is (Supabase Storage uploads)
 * - empty/unknown → fallback hero image
 */
export function resolveImage(url: string | null | undefined): string {
  if (!url) return hero;
  if (url.startsWith("asset:")) {
    const key = url.slice(6);
    return assetMap[key] ?? hero;
  }
  return url;
}
