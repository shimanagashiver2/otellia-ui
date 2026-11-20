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

const RARITY_IMAGE_MAP = {
  'S+': '/images/rarity/s-plus.png',
  S: '/images/rarity/s.png',
  'A+': '/images/rarity/a-plus.png',
  A: '/images/rarity/a.png',
  B: '/images/rarity/b.png',
  C: '/images/rarity/c.png',
};

export function rarityImageUrl(rarity) {
  const path = RARITY_IMAGE_MAP[rarity] || '/images/rarity/c.png';
  return assetPath(path);
}
