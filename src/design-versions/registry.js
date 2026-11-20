import v0Legacy from './v0-legacy';
import v1LabSlate from './v1-lab-slate';
import v2LabPrecision from './v2-lab-precision';
import v3LabSoft from './v3-lab-soft';
import v4SharpLab from './v4-sharp-lab';
import { BG_PATTERN_OPTIONS, createDefaultExtensions } from './defaults';
import { sanitizeHexColor } from '@/lib/colorUtils';

export const BUILTIN_VERSIONS = [
  v4SharpLab,
  v1LabSlate,
  v2LabPrecision,
  v3LabSoft,
  v0Legacy,
];
export const BUILTIN_VERSION_MAP = Object.fromEntries(
  BUILTIN_VERSIONS.map((v) => [v.id, v])
);
export const DEFAULT_ACTIVE_VERSION_ID = 'v4-sharp-lab';
export const LAB_STORAGE_KEY = 'otellia-ui-lab-state-v1';

const LEGACY_CARD_PATTERN_MAP = {
  hairline: 'datasheet',
  typographic: 'pillar-compact',
  instrument: 'game-band',
  ribbon: 'side-action',
  tonal: 'lab-ledger',
};

const VALID_CARD_PATTERNS = new Set([
  'legacy',
  'game-band',
  'side-action',
  'datasheet',
  'pillar-compact',
  'lab-ledger',
]);

const VALID_APPLY_MODES = new Set([
  'title-band',
  'left-bar',
  'top-bar',
  'tinted',
]);

const VALID_UI_FINISHES = new Set(['precision', 'carbon', 'tactile']);

const VALID_BG_PATTERNS = new Set(BG_PATTERN_OPTIONS.map((p) => p.id));

function mergeSection(base, incoming) {
  return {
    ...(base || {}),
    ...(incoming && typeof incoming === 'object' ? incoming : {}),
  };
}

function sanitizeCostTheme(theme, fallbackTheme) {
  const merged = mergeSection(fallbackTheme, theme);
  return {
    downBg: sanitizeHexColor(merged.downBg, fallbackTheme.downBg),
    downText: sanitizeHexColor(merged.downText, fallbackTheme.downText),
    downBorder: sanitizeHexColor(merged.downBorder, fallbackTheme.downBorder),
    upBg: sanitizeHexColor(merged.upBg, fallbackTheme.upBg),
    upText: sanitizeHexColor(merged.upText, fallbackTheme.upText),
    upBorder: sanitizeHexColor(merged.upBorder, fallbackTheme.upBorder),
    normalBg: sanitizeHexColor(merged.normalBg, fallbackTheme.normalBg),
    normalText: sanitizeHexColor(merged.normalText, fallbackTheme.normalText),
    normalBorder: sanitizeHexColor(merged.normalBorder, fallbackTheme.normalBorder),
  };
}

export function normalizeVersion(raw, fallback = v4SharpLab) {
  const defaults = createDefaultExtensions();
  const base = fallback || v4SharpLab;
  const src = raw && typeof raw === 'object' ? raw : {};

  const mergedGroupGradients = { ...defaults.groupGradients };
  for (const key of Object.keys(defaults.groupGradients)) {
    const merged = {
      ...defaults.groupGradients[key],
      ...(base.groupGradients?.[key] || {}),
      ...(src.groupGradients?.[key] || {}),
    };
    if (!merged.mid || typeof merged.mid !== 'string' || !merged.mid.trim()) {
      merged.useMid = false;
      merged.mid = defaults.groupGradients[key].mid;
    }
    mergedGroupGradients[key] = merged;
  }

  const rawPattern = src.cardPattern || base.cardPattern || 'datasheet';
  const mappedPattern = LEGACY_CARD_PATTERN_MAP[rawPattern] || rawPattern;
  const cardPattern = VALID_CARD_PATTERNS.has(mappedPattern)
    ? mappedPattern
    : 'datasheet';

  const rawApplyMode = src.groupApplyMode || base.groupApplyMode || 'title-band';
  const groupApplyMode = VALID_APPLY_MODES.has(rawApplyMode)
    ? rawApplyMode
    : 'title-band';

  const shapeMerged = mergeSection(base.shape, src.shape);
  if (!VALID_BG_PATTERNS.has(shapeMerged.bgPattern)) {
    shapeMerged.bgPattern = 'none';
  }
  if (!Number.isFinite(Number(shapeMerged.bgPatternStrength))) {
    shapeMerged.bgPatternStrength = 1;
  }

  const rawUiFinish = src.uiFinish || base.uiFinish || 'precision';
  const uiFinish = VALID_UI_FINISHES.has(rawUiFinish) ? rawUiFinish : 'precision';

  return {
    id: typeof src.id === 'string' && src.id.trim() ? src.id.trim() : base.id,
    name:
      typeof src.name === 'string' && src.name.trim()
        ? src.name.trim()
        : base.name,
    description:
      typeof src.description === 'string'
        ? src.description
        : base.description || '',
    builtin: Boolean(src.builtin && BUILTIN_VERSION_MAP[src.id]),
    cardPattern,
    groupApplyMode,
    uiFinish,
    shape: shapeMerged,
    themes: {
      light: mergeSection(base.themes?.light, src.themes?.light),
      dark: mergeSection(base.themes?.dark, src.themes?.dark),
    },
    attributes: {
      light: mergeSection(
        defaults.attributes.light,
        mergeSection(base.attributes?.light, src.attributes?.light)
      ),
      dark: mergeSection(
        defaults.attributes.dark,
        mergeSection(base.attributes?.dark, src.attributes?.dark)
      ),
    },
    rarityBorders: {
      light: mergeSection(
        defaults.rarityBorders.light,
        mergeSection(base.rarityBorders?.light, src.rarityBorders?.light)
      ),
      dark: mergeSection(
        defaults.rarityBorders.dark,
        mergeSection(base.rarityBorders?.dark, src.rarityBorders?.dark)
      ),
    },
    matrix: mergeSection(
      defaults.matrix,
      mergeSection(base.matrix, src.matrix)
    ),
    fonts: mergeSection(defaults.fonts, mergeSection(base.fonts, src.fonts)),
    cardMixer: mergeSection(
      defaults.cardMixer,
      mergeSection(base.cardMixer, src.cardMixer)
    ),
    costOverlay: {
      placement:
        src.costOverlay?.placement ||
        base.costOverlay?.placement ||
        defaults.costOverlay.placement,
      light: sanitizeCostTheme(
        mergeSection(base.costOverlay?.light, src.costOverlay?.light),
        defaults.costOverlay.light
      ),
      dark: sanitizeCostTheme(
        mergeSection(base.costOverlay?.dark, src.costOverlay?.dark),
        defaults.costOverlay.dark
      ),
    },
    slotOverlay: mergeSection(
      defaults.slotOverlay,
      mergeSection(base.slotOverlay, src.slotOverlay)
    ),
    groupGradients: mergedGroupGradients,
  };
}

export function createInitialVersions() {
  return BUILTIN_VERSIONS.map((v) =>
    normalizeVersion(structuredClone(v), v)
  );
}

export function cloneVersion(baseVersion, customName) {
  const suffix = Date.now().toString(36).slice(-5);
  const copy = structuredClone(normalizeVersion(baseVersion, v4SharpLab));
  copy.id = `custom-${suffix}`;
  copy.name =
    customName || `${baseVersion.name.replace(/^v\d+:\s*/, '')} (派生)`;
  copy.description = `${baseVersion.name} をベースにしたカスタム案`;
  copy.builtin = false;
  return copy;
}

export function getInitialLabState() {
  return {
    versions: createInitialVersions(),
    activeVersionId: DEFAULT_ACTIVE_VERSION_ID,
    viewportWidth: 'full',
    activeSection: 'all',
  };
}
