export function toPickerHex(value, fallback = '#000000') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{8}$/.test(trimmed)) {
    return trimmed.slice(0, 7).toLowerCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{7}$/.test(trimmed)) {
    return `#${trimmed.slice(1, 7)}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{4}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const match = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (match) {
    const [r, g, b] = [match[1], match[2], match[3]].map((n) =>
      Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0')
    );
    return `#${r}${g}${b}`;
  }
  return fallback;
}

export function sanitizeHexColor(value, fallback = '#00000000') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === 'transparent') return '#00000000';
  if (/^#[0-9a-fA-F]{7}$/.test(trimmed)) {
    return `${trimmed}0`.toLowerCase();
  }
  return trimmed || fallback;
}
