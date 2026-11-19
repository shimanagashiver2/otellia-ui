import v0Legacy from './v0-legacy';
import v1LabSlate from './v1-lab-slate';
import v2LabPrecision from './v2-lab-precision';
import v3LabSoft from './v3-lab-soft';
import { createDefaultExtensions } from './defaults';

export const BUILTIN_VERSIONS = [v1LabSlate, v2LabPrecision, v3LabSoft, v0Legacy];
export const BUILTIN_VERSION_MAP = Object.fromEntries(BUILTIN_VERSIONS.map((v) => [v.id, v]));
export const DEFAULT_ACTIVE_VERSION_ID = 'v1-lab-slate';
export const LAB_STORAGE_KEY = 'otellia-ui-lab-state-v1';

function mergeSection(base, incoming) {
  return { ...(base || {}), ...(incoming && typeof incoming === 'object' ? incoming : {}) };
}

export function normalizeVersion(raw, fallback = v1LabSlate) {
  const defaults = createDefaultExtensions();
  const base = fallback || v1LabSlate;
  const src = raw && typeof raw === 'object' ? raw : {};

  const mergedGroupGradients = { ...defaults.groupGradients };
  for (const key of Object.keys(defaults.groupGradients)) {
    mergedGroupGradients[key] = {
      ...defaults.groupGradients[key],
      ...(base.groupGradients?.[key] || {}),
      ...(src.groupGradients?.[key] || {}),
    };
  }

  return {
    id: typeof src.id === 'string' && src.id.trim() ? src.id.trim() : base.id,
    name: typeof src.name === 'string' && src.name.trim() ? src.name.trim() : base.name,
    description: typeof src.description === 'string' ? src.description : base.description || '',
    builtin: Boolean(src.builtin && BUILTIN_VERSION_MAP[src.id]),
    cardPattern: src.cardPattern || base.cardPattern || 'instrument',
    groupApplyMode: src.groupApplyMode || base.groupApplyMode || 'left-bar',
    shape: mergeSection(base.shape, src.shape),
    themes: {
      light: mergeSection(base.themes?.light, src.themes?.light),
      dark: mergeSection(base.themes?.dark, src.themes?.dark),
    },
    attributes: {
      light: mergeSection(defaults.attributes.light, mergeSection(base.attributes?.light, src.attributes?.light)),
      dark: mergeSection(defaults.attributes.dark, mergeSection(base.attributes?.dark, src.attributes?.dark)),
    },
    rarityBorders: {
      light: mergeSection(defaults.rarityBorders.light, mergeSection(base.rarityBorders?.light, src.rarityBorders?.light)),
      dark: mergeSection(defaults.rarityBorders.dark, mergeSection(base.rarityBorders?.dark, src.rarityBorders?.dark)),
    },
    matrix: mergeSection(defaults.matrix, mergeSection(base.matrix, src.matrix)),
    groupGradients: mergedGroupGradients,
  };
}

export function createInitialVersions() {
  return BUILTIN_VERSIONS.map((v) => normalizeVersion(structuredClone(v), v));
}

export function cloneVersion(baseVersion, customName) {
  const suffix = Date.now().toString(36).slice(-5);
  const copy = structuredClone(normalizeVersion(baseVersion, v1LabSlate));
  copy.id = `custom-${suffix}`;
  copy.name = customName || `${baseVersion.name.replace(/^v\d+:\s*/, '')} (派生)`;
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
