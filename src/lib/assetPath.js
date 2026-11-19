export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function assetPath(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}

export function pieceImageUrl(id) {
  if (!id || id <= 0) return assetPath('/default.png');
  return `https://character-images.othellonia.com/piece/${id}.png`;
}
