/**
 * Image optimization resolver.
 * Swaps .png/.jpg paths for .webp when an optimized version exists in the manifest.
 */

export async function fetchImageManifest(): Promise<Set<string>> {
  try {
    const manifest = await fetch('/images/images-manifest.json').then((r) => r.json() as Promise<string[]>)
    return new Set(manifest)
  } catch {
    return new Set()
  }
}

export function resolveOptimizedImage(originalImage: string, optimizedSet: Set<string>): string {
  if (!originalImage) return ''
  const webpImage = originalImage.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  return optimizedSet.has(webpImage) ? webpImage : originalImage
}
