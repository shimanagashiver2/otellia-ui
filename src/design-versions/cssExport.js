import { GROUP_ITEMS } from '@/data/sampleDecks';
import { buildGradientCss, buildTintGradientCss, resolveGroupTextColor } from '@/lib/gradient';

function resolveBgPattern(pattern, patternColor) {
  if (pattern === 'dots') {
    return {
      image: `radial-gradient(${patternColor} 1px, transparent 1px)`,
      size: '20px 20px',
    };
  }
  if (pattern === 'grid') {
    return {
      image: `linear-gradient(to right, ${patternColor} 1px, transparent 1px), linear-gradient(to bottom, ${patternColor} 1px, transparent 1px)`,
      size: '24px 24px',
    };
  }
  return {
    image: 'none',
    size: 'auto',
  };
}

export function versionToStyleVars(version, mode = 'light') {
  const safeMode = mode === 'dark' ? 'dark' : 'light';
  const theme = version.themes?.[safeMode] || version.themes.light;
  const attrs = version.attributes?.[safeMode] || version.attributes.light;
  const rarity = version.rarityBorders?.[safeMode] || version.rarityBorders.light;
  const shape = version.shape || {};
  const matrix = version.matrix || {};
  const bgPattern = resolveBgPattern(shape.bgPattern, theme.bgPatternColor);

  const vars = {
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

    '--lab-card-radius': `${Number(shape.cardRadius ?? 12)}px`,
    '--lab-inner-radius': `${Number(shape.innerRadius ?? 8)}px`,
    '--lab-badge-radius': `${Number(shape.badgeRadius ?? 6)}px`,
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

    '--matrix-cell-size': `${Number(matrix.cellSize ?? 13)}px`,
    '--matrix-gap': `${Number(matrix.gap ?? 3)}px`,
    '--matrix-border-width': `${Number(matrix.borderWidth ?? 2)}px`,
    '--matrix-radius': `${Number(matrix.radius ?? 3)}px`,

    accentColor: theme.accent,
  };

  for (const group of GROUP_ITEMS) {
    const grad = version.groupGradients?.[group.key];
    vars[`--group-gradient-${group.key}`] = buildGradientCss(grad);
    vars[`--group-tint-${group.key}`] = buildTintGradientCss(grad, safeMode === 'dark' ? 0.16 : 0.11);
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
  const shape = version.shape;
  const matrix = version.matrix;

  const lightPattern = resolveBgPattern(shape.bgPattern, light.bgPatternColor);
  const darkPattern = resolveBgPattern(shape.bgPattern, dark.bgPatternColor);

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
 * ===================================================== */

:root {
  color-scheme: light dark;

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

  /* 4x4マトリクス レアリティ枠線（Light） */
  --rarity-border-s: ${lightRarity.S};
  --rarity-border-a: ${lightRarity.A};
  --rarity-border-b: ${lightRarity.B};
  --rarity-border-c: ${lightRarity.C};
  --rarity-border-empty: ${lightRarity.empty};
  --matrix-cell-size: ${matrix.cellSize}px;
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

  /* 4x4マトリクス レアリティ枠線（Dark） */
  --rarity-border-s: ${darkRarity.S};
  --rarity-border-a: ${darkRarity.A};
  --rarity-border-b: ${darkRarity.B};
  --rarity-border-c: ${darkRarity.C};
  --rarity-border-empty: ${darkRarity.empty};
}
`;
}
