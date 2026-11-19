export const DEFAULT_ATTRIBUTES = {
  light: {
    god: '#eab308',
    devil: '#9333ea',
    dragon: '#dc2626',
    neutral: '#2563eb',
  },
  dark: {
    god: '#facc15',
    devil: '#a855f7',
    dragon: '#ef4444',
    neutral: '#60a5fa',
  },
};

export const DEFAULT_RARITY_BORDERS = {
  light: {
    S: '#0f172a',
    A: '#0284c7',
    B: '#16a34a',
    C: '#94a3b8',
    empty: '#cbd5e1',
  },
  dark: {
    S: '#f8fafc',
    A: '#38bdf8',
    B: '#4ade80',
    C: '#64748b',
    empty: '#334155',
  },
};

export const RARITY_BORDER_PRESETS = {
  contrast: {
    label: '高コントラスト（識別重視）',
    light: { S: '#0f172a', A: '#0284c7', B: '#16a34a', C: '#94a3b8', empty: '#cbd5e1' },
    dark: { S: '#f8fafc', A: '#38bdf8', B: '#4ade80', C: '#64748b', empty: '#334155' },
  },
  tier: {
    label: '金属ランク風（白金/銀/翠/灰）',
    light: { S: '#1e1b4b', A: '#64748b', B: '#0d9488', C: '#cbd5e1', empty: '#e2e8f0' },
    dark: { S: '#fef08a', A: '#cbd5e1', B: '#2dd4bf', C: '#475569', empty: '#334155' },
  },
  mono: {
    label: '線明度差のみ（極小ノイズ）',
    light: { S: '#09090b', A: '#52525b', B: '#a1a1aa', C: '#d4d4d8', empty: '#e4e4e7' },
    dark: { S: '#fafafa', A: '#a1a1aa', B: '#52525b', C: '#3f3f46', empty: '#27272a' },
  },
};

export const DEFAULT_MATRIX_CONFIG = {
  cellSize: 13,
  gap: 3,
  borderWidth: 2,
  radius: 3,
  leaderMarker: 'blank', // 'blank' | 'dot' | 'L'
};

export const DEFAULT_GROUP_GRADIENTS = {
  '0': { start: '#64748b', mid: '#94a3b8', useMid: false, end: '#475569', angle: 135, textColor: 'auto' },
  '1': { start: '#0ea5e9', mid: '#38bdf8', useMid: false, end: '#2563eb', angle: 135, textColor: 'auto' },
  '2': { start: '#f59e0b', mid: '#fb7185', useMid: true, end: '#db2777', angle: 135, textColor: 'auto' },
  '3': { start: '#06b6d4', mid: '#3b82f6', useMid: false, end: '#4f46e5', angle: 135, textColor: 'auto' },
  '4': { start: '#475569', mid: '#64748b', useMid: false, end: '#334155', angle: 135, textColor: 'auto' },
  '5': { start: '#e2e8f0', mid: '#94a3b8', useMid: false, end: '#64748b', angle: 135, textColor: 'auto' },
  '6': { start: '#ef4444', mid: '#f97316', useMid: false, end: '#b91c1c', angle: 135, textColor: 'auto' },
  '7': { start: '#8b5cf6', mid: '#a855f7', useMid: false, end: '#6d28d9', angle: 135, textColor: 'auto' },
  '8': { start: '#10b981', mid: '#14b8a6', useMid: false, end: '#0f766e', angle: 135, textColor: 'auto' },
  '9': { start: '#eab308', mid: '#f59e0b', useMid: false, end: '#b45309', angle: 135, textColor: 'auto' },
  a: { start: '#ec4899', mid: '#a855f7', useMid: true, end: '#6366f1', angle: 135, textColor: 'auto' },
};

export function createDefaultExtensions() {
  return {
    attributes: structuredClone(DEFAULT_ATTRIBUTES),
    rarityBorders: structuredClone(DEFAULT_RARITY_BORDERS),
    matrix: { ...DEFAULT_MATRIX_CONFIG },
    groupGradients: structuredClone(DEFAULT_GROUP_GRADIENTS),
  };
}
