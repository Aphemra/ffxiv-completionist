export function createPublicDataUrl(relativePath: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  const normalizedPath = relativePath.replace(/^\/+/, '');

  return `${baseUrl}${normalizedPath}`;
}