export const DEFAULT_ATTRIBUTES = {
  light: {
    god: '#ffd414',
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
    S: '#71c7c1',
    A: '#ffbb00',
    B: '#b3b3b3',
    C: '#e89776',
    empty: '#000000',
  },
  dark: {
    S: '#49f5f2',
    A: '#faf693',
    B: '#dedede',
    C: '#d69a63',
    empty: '#ffffff',
  },
};

export const RARITY_BORDER_PRESETS = {
  user: {
    label: 'ユーザー調整（現行標準）',
    light: { S: '#71c7c1', A: '#ffbb00', B: '#b3b3b3', C: '#e89776', empty: '#000000' },
    dark: { S: '#49f5f2', A: '#faf693', B: '#dedede', C: '#d69a63', empty: '#ffffff' },
  },
  contrast: {
    label: '高コントラスト（黒白軸）',
    light: { S: '#0f172a', A: '#0284c7', B: '#16a34a', C: '#94a3b8', empty: '#cbd5e1' },
    dark: { S: '#f8fafc', A: '#38bdf8', B: '#4ade80', C: '#64748b', empty: '#334155' },
  },
  mono: {
    label: '線明度差のみ（極小ノイズ）',
    light: { S: '#09090b', A: '#52525b', B: '#a1a1aa', C: '#d4d4d8', empty: '#e4e4e7' },
    dark: { S: '#fafafa', A: '#a1a1aa', B: '#52525b', C: '#3f3f46', empty: '#27272a' },
  },
};

export const DEFAULT_MATRIX_CONFIG = {
  cellSize: 20,
  cardCellSize: 12,
  gap: 2,
  borderWidth: 3,
  radius: 0,
  leaderMarker: 'dot', // 'blank' | 'dot' | 'L'
};

export const DEFAULT_FONTS = {
  ui: 'noto-sans-jp',
  mono: 'roboto-mono',
};

export const DEFAULT_CARD_MIXER = {
  visualLayout: 'stacked', // 'stacked' | 'inline'
  showMetaLine: false,
  commentSize: 10,
};

export const DEFAULT_COST_OVERLAY = {
  placement: 'top-tag-bottom-num',
  light: {
    downBg: '#bdb600',
    downText: '#ffffff',
    downBorder: '#00000000',
    upBg: '#423fee',
    upText: '#ffffff',
    upBorder: '#00000000',
    normalBg: '#00000088',
    normalText: '#ffffff',
    normalBorder: '#00000000',
  },
  dark: {
    downBg: '#a19b00',
    downText: '#ffffff',
    downBorder: '#00000000',
    upBg: '#3b48f5',
    upText: '#ffffff',
    upBorder: '#00000000',
    normalBg: '#00000088',
    normalText: '#ffffff',
    normalBorder: '#00000000',
  },
};

export const DEFAULT_SLOT_OVERLAY = {
  labelSize: 9.5,
  valueSize: 15,
  plusValueSize: 11.5,
  tagSize: 9.5,
  strokeWidth: 2.5,
  lineGap: 0,
};

export const BG_PATTERN_OPTIONS = [
  { id: 'none', label: '無地', desc: '純色背景のみ' },
  { id: 'fine-grid', label: '精密設計方眼', desc: '96px大枠＋16px細線' },
  { id: 'board-stars', label: '盤面星点', desc: '64px対局盤格子＋星点' },
  { id: 'hex-mesh', label: '六角ハニカム', desc: '正六角形構造メッシュ' },
  { id: 'micro-ticks', label: '目盛りルーラー', desc: '交点測距ティックのみ' },
  { id: 'blueprint-frame', label: 'コーナーブラケット', desc: '80pxピッチL字印' },
  { id: 'woven-twill', label: '極細綾織', desc: '8pxピッチ微細カーボン' },
  { id: 'vertical-ledger', label: '縦カラム台帳', desc: '120px主線＋30px縦軸' },
  { id: 'concentric-radar', label: '幾何学アーク', desc: '96px同心円弧コンパス' },
];

export const DEFAULT_GROUP_GRADIENTS = {
  '0': { start: '#1fb0b5', mid: '#63b68c', useMid: false, end: '#a9bd62', angle: 135, textColor: '#f8fafc' },
  '1': { start: '#c92812', mid: '#c92812', useMid: true, end: '#e6b55c', angle: 135, textColor: 'auto' },
  '2': { start: '#f59e0b', mid: '#f59e0b', useMid: true, end: '#ffd900', angle: 135, textColor: '#f8fafc' },
  '3': { start: '#005a91', mid: '#005a91', useMid: true, end: '#e6dc5e', angle: 135, textColor: '#f8fafc' },
  '4': { start: '#475569', mid: '#64748b', useMid: false, end: '#334155', angle: 135, textColor: 'auto' },
  '5': { start: '#64748b', mid: '#64748b', useMid: true, end: '#abc4c4', angle: 135, textColor: '#f8fafc' },
  '6': { start: '#bf1369', mid: '#bf1369', useMid: true, end: '#ffa3b2', angle: 135, textColor: 'auto' },
  '7': { start: '#bf1369', mid: '#bf1369', useMid: true, end: '#b3b6ff', angle: 135, textColor: 'auto' },
  '8': { start: '#bf1369', mid: '#bf1369', useMid: true, end: '#adffb4', angle: 135, textColor: '#f8fafc' },
  '9': { start: '#3b3b3b', mid: '#525252', useMid: true, end: '#858585', angle: 135, textColor: 'auto' },
  a: { start: '#ec4899', mid: '#a855f7', useMid: true, end: '#6366f1', angle: 135, textColor: 'auto' },
};

export function createDefaultExtensions() {
  return {
    attributes: structuredClone(DEFAULT_ATTRIBUTES),
    rarityBorders: structuredClone(DEFAULT_RARITY_BORDERS),
    matrix: { ...DEFAULT_MATRIX_CONFIG },
    groupGradients: structuredClone(DEFAULT_GROUP_GRADIENTS),
    fonts: { ...DEFAULT_FONTS },
    cardMixer: { ...DEFAULT_CARD_MIXER },
    costOverlay: structuredClone(DEFAULT_COST_OVERLAY),
    slotOverlay: { ...DEFAULT_SLOT_OVERLAY },
    uiFinish: 'precision',
  };
}
