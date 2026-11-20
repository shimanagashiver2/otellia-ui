import { GROUP_ITEMS } from '@/data/sampleDecks';
import { sanitizeHexColor } from '@/lib/colorUtils';
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
  const fbRgb = mode === 'dark' ? '148, 163, 184' : '15, 23, 42';
  const c = scalePatternColor(patternColor, strength, fbRgb);
  const cSoft = scalePatternColor(patternColor, strength * 0.65, fbRgb);
  const cStrong = scalePatternColor(patternColor, strength * 1.9, fbRgb);

  switch (pattern) {
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
    case 'board-stars': {
      const sLine = encodeURIComponent(c);
      const sDot = encodeURIComponent(cStrong);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><path d='M64 0H0v64' stroke='${sLine}' stroke-width='1' fill='none'/><circle cx='32' cy='32' r='1.75' fill='${sDot}'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '64px 64px',
      };
    }
    case 'hex-mesh': {
      const sHex = encodeURIComponent(c);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='96' viewBox='0 0 56 96'><path d='M28 0L56 16v32L28 64 0 48V16Z M28 64v32 M0 48l-28 16 M56 48l28 16 M0 16L28 0' stroke='${sHex}' stroke-width='1' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '56px 96px',
      };
    }
    case 'micro-ticks': {
      const sTick = encodeURIComponent(cStrong);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M20 0v4M20 36v4M0 20h4M36 20h4M18.5 20h3M20 18.5v3' stroke='${sTick}' stroke-width='1' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '40px 40px',
      };
    }
    case 'blueprint-frame': {
      const sCorner = encodeURIComponent(cStrong);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><path d='M0 8V0h8M72 0h8v8M0 72v8h8M72 80h8v-8' stroke='${sCorner}' stroke-width='1' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '80px 80px',
      };
    }
    case 'woven-twill': {
      const sA = encodeURIComponent(c);
      const sB = encodeURIComponent(cSoft);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'><path d='M0 4h4v4H0zM4 0h4v4H4z' fill='${sB}'/><path d='M0 8L8 0' stroke='${sA}' stroke-width='0.75'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '8px 8px',
      };
    }
    case 'vertical-ledger':
      return {
        image: `linear-gradient(to right, ${cStrong} 1px, transparent 1px), linear-gradient(to right, ${cSoft} 1px, transparent 1px)`,
        size: '120px 100%, 30px 100%',
      };
    case 'concentric-radar': {
      const sArc = encodeURIComponent(c);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><circle cx='48' cy='48' r='22' stroke='${sArc}' stroke-width='0.9' fill='none'/><circle cx='48' cy='48' r='42' stroke='${sArc}' stroke-width='0.9' stroke-dasharray='3 5' fill='none'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${svg}")`,
        size: '96px 96px',
      };
    }
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
  const slotOv = version.slotOverlay || {};
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

    // コスト増減チップ用：減少=黄色、増加=青
    '--chip-cost-down-text': safeMode === 'dark' ? '#fde047' : '#854d0e',
    '--chip-cost-down-border': safeMode === 'dark' ? '#eab308' : '#ca8a04',
    '--chip-cost-down-bg': safeMode === 'dark' ? 'rgba(250, 204, 21, 0.14)' : 'rgba(234, 179, 8, 0.16)',
    '--chip-cost-up-text': safeMode === 'dark' ? '#60a5fa' : '#1d4ed8',
    '--chip-cost-up-border': safeMode === 'dark' ? '#3b82f6' : '#2563eb',
    '--chip-cost-up-bg': safeMode === 'dark' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.10)',

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

    '--cost-down-bg': sanitizeHexColor(costOv.downBg, '#bdb600'),
    '--cost-down-text': sanitizeHexColor(costOv.downText, '#ffffff'),
    '--cost-down-border': sanitizeHexColor(costOv.downBorder, '#00000000'),
    '--cost-up-bg': sanitizeHexColor(costOv.upBg, '#423fee'),
    '--cost-up-text': sanitizeHexColor(costOv.upText, '#ffffff'),
    '--cost-up-border': sanitizeHexColor(costOv.upBorder, '#00000000'),
    '--cost-normal-bg': sanitizeHexColor(costOv.normalBg, '#00000088'),
    '--cost-normal-text': sanitizeHexColor(costOv.normalText, '#ffffff'),
    '--cost-normal-border': sanitizeHexColor(costOv.normalBorder, '#00000000'),

    '--slot-label-size': `${Number(slotOv.labelSize ?? 9.5)}px`,
    '--slot-value-size': `${Number(slotOv.valueSize ?? 15)}px`,
    '--slot-plus-size': `${Number(slotOv.plusValueSize ?? 11.5)}px`,
    '--slot-tag-size': `${Number(slotOv.tagSize ?? 9.5)}px`,
    '--slot-stroke-width': `${Number(slotOv.strokeWidth ?? 2.5)}px`,
    '--slot-line-gap': `${Number(slotOv.lineGap ?? 0)}px`,

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
  const slotOv = version.slotOverlay || {};
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
 * UI Finish: ${version.uiFinish || 'precision'} | BG Pattern: ${shape.bgPattern} (x${shape.bgPatternStrength ?? 1})
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
  --cost-down-bg: ${sanitizeHexColor(lightCost.downBg, '#bdb600')};
  --cost-down-text: ${sanitizeHexColor(lightCost.downText, '#ffffff')};
  --cost-down-border: ${sanitizeHexColor(lightCost.downBorder, '#00000000')};
  --cost-up-bg: ${sanitizeHexColor(lightCost.upBg, '#423fee')};
  --cost-up-text: ${sanitizeHexColor(lightCost.upText, '#ffffff')};
  --cost-up-border: ${sanitizeHexColor(lightCost.upBorder, '#00000000')};
  --cost-normal-bg: ${sanitizeHexColor(lightCost.normalBg, '#00000088')};
  --cost-normal-text: ${sanitizeHexColor(lightCost.normalText, '#ffffff')};
  --cost-normal-border: ${sanitizeHexColor(lightCost.normalBorder, '#00000000')};

  /* 16枠テキストオーバーレイ寸法 */
  --slot-label-size: ${slotOv.labelSize ?? 9.5}px;
  --slot-value-size: ${slotOv.valueSize ?? 15}px;
  --slot-plus-size: ${slotOv.plusValueSize ?? 11.5}px;
  --slot-tag-size: ${slotOv.tagSize ?? 9.5}px;
  --slot-stroke-width: ${slotOv.strokeWidth ?? 2.5}px;
  --slot-line-gap: ${slotOv.lineGap ?? 0}px;

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
  --cost-down-bg: ${sanitizeHexColor(darkCost.downBg, '#a19b00')};
  --cost-down-text: ${sanitizeHexColor(darkCost.downText, '#ffffff')};
  --cost-down-border: ${sanitizeHexColor(darkCost.downBorder, '#00000000')};
  --cost-up-bg: ${sanitizeHexColor(darkCost.upBg, '#3b48f5')};
  --cost-up-text: ${sanitizeHexColor(darkCost.upText, '#ffffff')};
  --cost-up-border: ${sanitizeHexColor(darkCost.upBorder, '#00000000')};
  --cost-normal-bg: ${sanitizeHexColor(darkCost.normalBg, '#00000088')};
  --cost-normal-text: ${sanitizeHexColor(darkCost.normalText, '#ffffff')};
  --cost-normal-border: ${sanitizeHexColor(darkCost.normalBorder, '#00000000')};

  /* 4x4マトリクス レアリティ枠線（Dark） */
  --rarity-border-s: ${darkRarity.S};
  --rarity-border-a: ${darkRarity.A};
  --rarity-border-b: ${darkRarity.B};
  --rarity-border-c: ${darkRarity.C};
  --rarity-border-empty: ${darkRarity.empty};
}
`;
}
