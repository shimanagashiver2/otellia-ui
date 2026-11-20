import { GROUP_ITEMS } from '@/data/sampleDecks';
import {
  buildGradientCss,
  buildTintGradientCss,
  resolveGroupTextColor,
} from '@/lib/gradient';
import { resolveMonoFontFamily, resolveUiFontFamily } from './fonts';

function scalePatternColor(color, strength = 1, fallbackRgb = '15, 23, 42') {
  const s = Math.max(0.2, Math.min(3, Number(strength) || 1));
  if (typeof color !== 'string') return `rgba(${fallbackRgb}, ${0.06 * s})`;
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (!match) return color;
  const [, r, g, b, rawA] = match;
  const baseA = rawA !== undefined ? Number(rawA) : 0.1;
  const scaledA = Math.max(0.01, Math.min(0.65, Number((baseA * s).toFixed(3))));
  return `rgba(${r}, ${g}, ${b}, ${scaledA})`;
}

export function resolveBgPattern(pattern, patternColor, strength = 1, mode = 'light') {
  const c = scalePatternColor(
    patternColor,
    strength,
    mode === 'dark' ? '148, 163, 184' : '15, 23, 42'
  );
  const cStrong = scalePatternColor(
    patternColor,
    strength * 1.9,
    mode === 'dark' ? '148, 163, 184' : '15, 23, 42'
  );

  switch (pattern) {
    case 'dots':
      return {
        image: `radial-gradient(${cStrong} 1px, transparent 1px)`,
        size: '20px 20px',
      };
    case 'grid':
      return {
        image: `linear-gradient(to right, ${c} 1px, transparent 1px), linear-gradient(to bottom, ${c} 1px, transparent 1px)`,
        size: '24px 24px',
      };
    case 'fine-grid':
      return {
        image: [
          `linear-gradient(to right, ${cStrong} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${cStrong} 1px, transparent 1px)`,
          `linear-gradient(to right, ${c} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${c} 1px, transparent 1px)`,
        ].join(', '),
        size: '96px 96px, 96px 96px, 16px 16px, 16px 16px',
      };
    case 'cross': {
      const stroke = encodeURIComponent(cStrong);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M14 10v8M10 14h8' stroke='${stroke}' stroke-width='1' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '28px 28px',
      };
    }
    case 'diagonal':
      return {
        image: `repeating-linear-gradient(-45deg, transparent 0 11px, ${c} 11px 12px)`,
        size: 'auto',
      };
    case 'isometric': {
      const stroke = encodeURIComponent(c);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M16 0L32 16L16 32L0 16Z' stroke='${stroke}' stroke-width='1' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '32px 32px',
      };
    }
    case 'noise': {
      const opacity = Math.min(0.22, 0.055 * (Number(strength) || 1)).toFixed(3);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='${opacity}'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '140px 140px',
      };
    }
    case 'vignette':
      return {
        image: `radial-gradient(circle at 50% 25%, transparent 35%, ${cStrong} 100%)`,
        size: '100% 100%',
      };
    default:
      return {
        image: 'none',
        size: 'auto',
      };
  }
}

export function versionToStyleVars(version, mode = 'light') {
  const safeMode = mode === 'dark' ? 'dark' : 'light';
  const theme = version.themes?.[safeMode] || version.themes.light;
  const attrs = version.attributes?.[safeMode] || version.attributes.light;
  const rarity = version.rarityBorders?.[safeMode] || version.rarityBorders.light;
  const costOv = version.costOverlay?.[safeMode] || version.costOverlay?.light || {};
  const shape = version.shape || {};
  const matrix = version.matrix || {};
  const fonts = version.fonts || {};
  const cardMixer = version.cardMixer || {};
  const bgPattern = resolveBgPattern(
    shape.bgPattern,
    theme.bgPatternColor,
    shape.bgPatternStrength ?? 1,
    safeMode
  );

  const vars = {
    '--font-ui': resolveUiFontFamily(fonts.ui),
    '--font-num': resolveMonoFontFamily(fonts.mono),

    '--lab-bg': theme.bg,
    '--lab-bg-image': bgPattern.image,
    '--lab-bg-size': bgPattern.size,
    '--lab-surface-1': theme.surface1,
    '--lab-surface-2': theme.surface2,
    '--lab-surface-subtle': theme.surfaceSubtle,
    '--lab-header-bg': theme.headerBg,
    '--lab-border': theme.border,
    '--lab-border-strong': theme.borderStrong,
    '--lab-text': theme.text,
    '--lab-text-muted': theme.textMuted,
    '--lab-text-faint': theme.textFaint,
    '--lab-accent': theme.accent,
    '--lab-accent-text': theme.accentText,
    '--lab-accent-soft': theme.accentSoft,
    '--lab-shadow': theme.shadow,
    '--lab-glow': theme.glow || 'none',
    '--lab-danger': theme.danger,
    '--lab-warning': theme.warning,
    '--lab-success': theme.success,

    '--lab-card-radius': `${Number(shape.cardRadius ?? 0)}px`,
    '--lab-inner-radius': `${Number(shape.innerRadius ?? 0)}px`,
    '--lab-badge-radius': `${Number(shape.badgeRadius ?? 0)}px`,
    '--lab-border-width': `${Number(shape.borderWidth ?? 1)}px`,
    '--lab-blur': `${Number(shape.blur ?? 0)}px`,

    '--attr-god': attrs.god,
    '--attr-devil': attrs.devil,
    '--attr-dragon': attrs.dragon,
    '--attr-neutral': attrs.neutral,

    '--rarity-s': rarity.S,
    '--rarity-a': rarity.A,
    '--rarity-b': rarity.B,
    '--rarity-c': rarity.C,
    '--rarity-empty': rarity.empty,

    '--cost-down-bg': costOv.downBg || '#18181b',
    '--cost-down-text': costOv.downText || '#fde047',
    '--cost-down-border': costOv.downBorder || '#eab308',
    '--cost-up-bg': costOv.upBg || '#7f1d1d',
    '--cost-up-text': costOv.upText || '#fecaca',
    '--cost-up-border': costOv.upBorder || '#ef4444',
    '--cost-normal-bg': costOv.normalBg || '#ffffff',
    '--cost-normal-text': costOv.normalText || '#0f172a',
    '--cost-normal-border': costOv.normalBorder || '#94a3b8',

    '--matrix-cell-size': `${Number(matrix.cellSize ?? 20)}px`,
    '--card-matrix-cell-size': `${Number(matrix.cardCellSize ?? 12)}px`,
    '--matrix-gap': `${Number(matrix.gap ?? 2)}px`,
    '--matrix-border-width': `${Number(matrix.borderWidth ?? 3)}px`,
    '--matrix-radius': `${Number(matrix.radius ?? 0)}px`,

    '--dc-comment-size': `${Number(cardMixer.commentSize ?? 10)}px`,

    accentColor: theme.accent,
  };

  for (const group of GROUP_ITEMS) {
    const grad = version.groupGradients?.[group.key];
    vars[`--group-gradient-${group.key}`] = buildGradientCss(grad);
    vars[`--group-tint-${group.key}`] = buildTintGradientCss(
      grad,
      safeMode === 'dark' ? 0.16 : 0.11
    );
    vars[`--group-text-${group.key}`] = resolveGroupTextColor(grad);
  }

  return vars;
}

export function generateCssTokens(version) {
  const light = version.themes.light;
  const dark = version.themes.dark;
  const lightAttr = version.attributes.light;
  const darkAttr = version.attributes.dark;
  const lightRarity = version.rarityBorders.light;
  const darkRarity = version.rarityBorders.dark;
  const lightCost = version.costOverlay?.light || {};
  const darkCost = version.costOverlay?.dark || {};
  const shape = version.shape;
  const matrix = version.matrix;
  const fonts = version.fonts || {};

  const lightPattern = resolveBgPattern(
    shape.bgPattern,
    light.bgPatternColor,
    shape.bgPatternStrength ?? 1,
    'light'
  );
  const darkPattern = resolveBgPattern(
    shape.bgPattern,
    dark.bgPatternColor,
    shape.bgPatternStrength ?? 1,
    'dark'
  );

  const groupLines = GROUP_ITEMS.map((g) => {
    const cfg = version.groupGradients[g.key];
    return [
      `  --group-gradient-${g.key}: ${buildGradientCss(cfg)}; /* ${g.label} */`,
      `  --group-text-${g.key}: ${resolveGroupTextColor(cfg)};`,
    ].join('\n');
  }).join('\n');

  return `/* =====================================================
 * OTELLIA UI Design Tokens — ${version.name}
 * Card Pattern: ${version.cardPattern} | Group Mode: ${version.groupApplyMode}
 * BG Pattern: ${shape.bgPattern} (x${shape.bgPatternStrength ?? 1})
 * Cost Overlay Placement: ${version.costOverlay?.placement || 'top-tag-bottom-num'}
 * Fonts: UI=${fonts.ui || 'noto-sans-jp'} / NUM=${fonts.mono || 'roboto-mono'}
 * ===================================================== */

:root {
  color-scheme: light dark;

  /* フォント */
  --font-ui: ${resolveUiFontFamily(fonts.ui)};
  --font-num: ${resolveMonoFontFamily(fonts.mono)};

  /* サーフェス & テキスト（Light） */
  --bg-color: ${light.bg};
  --bg-pattern-image: ${lightPattern.image};
  --bg-pattern-size: ${lightPattern.size};
  --surface-1: ${light.surface1};
  --surface-2: ${light.surface2};
  --surface-subtle: ${light.surfaceSubtle};
  --header-bg: ${light.headerBg};
  --border-color: ${light.border};
  --border-strong: ${light.borderStrong};
  --text-color: ${light.text};
  --text-muted: ${light.textMuted};
  --text-faint: ${light.textFaint};
  --accent-color: ${light.accent};
  --accent-text: ${light.accentText};
  --accent-soft: ${light.accentSoft};
  --surface-shadow: ${light.shadow};

  /* 形状トークン */
  --radius-card: ${shape.cardRadius}px;
  --radius-inner: ${shape.innerRadius}px;
  --radius-badge: ${shape.badgeRadius}px;
  --border-width: ${shape.borderWidth}px;
  --surface-blur: ${shape.blur}px;

  /* 属性カラー（Light） */
  --color-god: ${lightAttr.god};
  --color-devil: ${lightAttr.devil};
  --color-dragon: ${lightAttr.dragon};
  --color-neutral: ${lightAttr.neutral};

  /* コスト増減表示カラー（Light） */
  --cost-down-bg: ${lightCost.downBg};
  --cost-down-text: ${lightCost.downText};
  --cost-down-border: ${lightCost.downBorder};
  --cost-up-bg: ${lightCost.upBg};
  --cost-up-text: ${lightCost.upText};
  --cost-up-border: ${lightCost.upBorder};
  --cost-normal-bg: ${lightCost.normalBg};
  --cost-normal-text: ${lightCost.normalText};
  --cost-normal-border: ${lightCost.normalBorder};

  /* 4x4マトリクス レアリティ枠線（Light） */
  --rarity-border-s: ${lightRarity.S};
  --rarity-border-a: ${lightRarity.A};
  --rarity-border-b: ${lightRarity.B};
  --rarity-border-c: ${lightRarity.C};
  --rarity-border-empty: ${lightRarity.empty};
  --matrix-cell-size: ${matrix.cellSize}px;
  --card-matrix-cell-size: ${matrix.cardCellSize ?? 12}px;
  --matrix-gap: ${matrix.gap}px;
  --matrix-border-width: ${matrix.borderWidth}px;
  --matrix-radius: ${matrix.radius}px;

  /* デッキグループ グラデーション（全11種） */
${groupLines}
}

html.dark-mode {
  --bg-color: ${dark.bg};
  --bg-pattern-image: ${darkPattern.image};
  --bg-pattern-size: ${darkPattern.size};
  --surface-1: ${dark.surface1};
  --surface-2: ${dark.surface2};
  --surface-subtle: ${dark.surfaceSubtle};
  --header-bg: ${dark.headerBg};
  --border-color: ${dark.border};
  --border-strong: ${dark.borderStrong};
  --text-color: ${dark.text};
  --text-muted: ${dark.textMuted};
  --text-faint: ${dark.textFaint};
  --accent-color: ${dark.accent};
  --accent-text: ${dark.accentText};
  --accent-soft: ${dark.accentSoft};
  --surface-shadow: ${dark.shadow};

  /* 属性カラー（Dark） */
  --color-god: ${darkAttr.god};
  --color-devil: ${darkAttr.devil};
  --color-dragon: ${darkAttr.dragon};
  --color-neutral: ${darkAttr.neutral};

  /* コスト増減表示カラー（Dark） */
  --cost-down-bg: ${darkCost.downBg};
  --cost-down-text: ${darkCost.downText};
  --cost-down-border: ${darkCost.downBorder};
  --cost-up-bg: ${darkCost.upBg};
  --cost-up-text: ${darkCost.upText};
  --cost-up-border: ${darkCost.upBorder};
  --cost-normal-bg: ${darkCost.normalBg};
  --cost-normal-text: ${darkCost.normalText};
  --cost-normal-border: ${darkCost.normalBorder};

  /* 4x4マトリクス レアリティ枠線（Dark） */
  --rarity-border-s: ${darkRarity.S};
  --rarity-border-a: ${darkRarity.A};
  --rarity-border-b: ${darkRarity.B};
  --rarity-border-c: ${darkRarity.C};
  --rarity-border-empty: ${darkRarity.empty};
}
`;
}
