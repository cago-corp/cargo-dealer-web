export function resolvePublicAssetUrl(
  baseUrl: string | undefined,
  assetPath: string | null | undefined,
) {
  if (!assetPath) {
    return null;
  }

  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  if (!baseUrl) {
    return assetPath;
  }

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedAssetPath = assetPath.startsWith("/")
    ? assetPath.slice(1)
    : assetPath;

  return `${normalizedBaseUrl}/${normalizedAssetPath}`;
}
