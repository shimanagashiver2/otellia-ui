function normalizeHex(hex, fallback = '#3b82f6') {
  if (typeof hex !== 'string') return fallback;
  const clean = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    const [, r, g, b] = clean;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export function hexToRgb(hex) {
  const safe = normalizeHex(hex, '#000000');
  const num = Number.parseInt(safe.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const clamped = Math.max(0, Math.min(1, Number(alpha) || 0));
  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((v) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function pickReadableTextColor(hexA, hexB) {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB || hexA);
  const avgLum = (lumA + lumB) / 2;
  return avgLum > 0.36 ? '#0f172a' : '#f8fafc';
}

export function resolveGroupTextColor(gradientConfig) {
  if (!gradientConfig) return '#f8fafc';
  if (gradientConfig.textColor && gradientConfig.textColor !== 'auto') {
    return gradientConfig.textColor;
  }
  return pickReadableTextColor(gradientConfig.start, gradientConfig.end);
}

export function buildGradientCss(gradientConfig) {
  if (!gradientConfig) return 'linear-gradient(135deg, #3b82f6, #0ea5e9)';
  const angle = Number.isFinite(Number(gradientConfig.angle)) ? Number(gradientConfig.angle) : 135;
  const start = normalizeHex(gradientConfig.start, '#3b82f6');
  const end = normalizeHex(gradientConfig.end, '#0ea5e9');
  if (gradientConfig.useMid && gradientConfig.mid) {
    const mid = normalizeHex(gradientConfig.mid, start);
    return `linear-gradient(${angle}deg, ${start} 0%, ${mid} 50%, ${end} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
}

export function buildTintGradientCss(gradientConfig, alpha = 0.14) {
  if (!gradientConfig) return 'transparent';
  const angle = Number.isFinite(Number(gradientConfig.angle)) ? Number(gradientConfig.angle) : 135;
  const start = hexToRgba(gradientConfig.start || '#3b82f6', alpha);
  const end = hexToRgba(gradientConfig.end || '#0ea5e9', alpha * 0.45);
  if (gradientConfig.useMid && gradientConfig.mid) {
    const mid = hexToRgba(gradientConfig.mid, alpha * 0.75);
    return `linear-gradient(${angle}deg, ${start} 0%, ${mid} 55%, ${end} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
}
