export const UI_FONT_OPTIONS = [
  {
    id: 'ibm-plex-sans-jp',
    label: 'IBM Plex Sans JP（研究・標準）',
    tag: '研究 / 明快',
    family:
      "'IBM Plex Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif",
  },
  {
    id: 'noto-sans-jp',
    label: 'Noto Sans JP（汎用ゴシック）',
    tag: '標準',
    family:
      "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
  },
  {
    id: 'zen-kaku',
    label: 'Zen Kaku Gothic New（角ゴシック）',
    tag: '直線的',
    family:
      "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', sans-serif",
  },
  {
    id: 'biz-udp',
    label: 'BIZ UDPGothic（高視認性プロポーショナル）',
    tag: '視認性',
    family:
      "'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', sans-serif",
  },
  {
    id: 'biz-ud-mono',
    label: 'BIZ UDGothic（日本語等幅）',
    tag: '日本語等幅',
    family:
      "'BIZ UDGothic', 'Hiragino Kaku Gothic ProN', monospace",
  },
  {
    id: 'mplus-1p',
    label: 'M PLUS 1p（モダンバランス）',
    tag: 'モダン',
    family:
      "'M PLUS 1p', 'Hiragino Kaku Gothic ProN', sans-serif",
  },
  {
    id: 'mplus-code',
    label: 'M PLUS 1 Code（日本語等幅コード）',
    tag: '日本語等幅',
    family:
      "'M PLUS 1 Code', 'Hiragino Kaku Gothic ProN', monospace",
  },
  {
    id: 'system-hiragino',
    label: 'システム標準 (Inter + ヒラギノ)',
    tag: '現行OTELLIA',
    family:
      "'Inter', 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif",
  },
];

export const MONO_FONT_OPTIONS = [
  {
    id: 'ibm-plex-mono',
    label: 'IBM Plex Mono（研究コンソール）',
    tag: '等幅 / 推奨',
    family: "'IBM Plex Mono', ui-monospace, monospace",
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono（高可読スラッシュ0）',
    tag: '等幅',
    family: "'JetBrains Mono', ui-monospace, monospace",
  },
  {
    id: 'geist-mono',
    label: 'Geist Mono（シャープ・最新Vercel系）',
    tag: '等幅',
    family: "'Geist Mono', ui-monospace, monospace",
  },
  {
    id: 'roboto-mono',
    label: 'Roboto Mono（Android/汎用計器）',
    tag: '等幅',
    family: "'Roboto Mono', ui-monospace, monospace",
  },
  {
    id: 'fira-code',
    label: 'Fira Code（スマート技術系）',
    tag: '等幅',
    family: "'Fira Code', ui-monospace, monospace",
  },
  {
    id: 'source-code-pro',
    label: 'Source Code Pro（Adobe堅実等幅）',
    tag: '等幅',
    family: "'Source Code Pro', ui-monospace, monospace",
  },
  {
    id: 'space-mono',
    label: 'Space Mono（SF・実験ラボ）',
    tag: '等幅 / 個性',
    family: "'Space Mono', ui-monospace, monospace",
  },
  {
    id: 'share-tech-mono',
    label: 'Share Tech Mono（HUD・電算機）',
    tag: '等幅 / 計器',
    family: "'Share Tech Mono', ui-monospace, monospace",
  },
  {
    id: 'azeret-mono',
    label: 'Azeret Mono（超直線・フラット）',
    tag: '等幅',
    family: "'Azeret Mono', ui-monospace, monospace",
  },
  {
    id: 'redhat-mono',
    label: 'Red Hat Mono（端正・太字見やすい）',
    tag: '等幅',
    family: "'Red Hat Mono', ui-monospace, monospace",
  },
  {
    id: 'chivo-mono',
    label: 'Chivo Mono（スリム高密度）',
    tag: '等幅 / 省幅',
    family: "'Chivo Mono', ui-monospace, monospace",
  },
  {
    id: 'inconsolata',
    label: 'Inconsolata（細身・コンパクト）',
    tag: '等幅 / 省幅',
    family: "'Inconsolata', ui-monospace, monospace",
  },
  {
    id: 'mplus-1-code-num',
    label: 'M PLUS 1 Code（和文揃い等幅）',
    tag: '和文等幅',
    family: "'M PLUS 1 Code', ui-monospace, monospace",
  },
  {
    id: 'biz-ud-num',
    label: 'BIZ UDGothic（日本語等幅数値）',
    tag: '和文等幅',
    family: "'BIZ UDGothic', ui-monospace, monospace",
  },
  {
    id: 'chakra-petch',
    label: 'Chakra Petch（ゲーム・メカ角張）',
    tag: '角張 / 非等幅',
    family: "'Chakra Petch', sans-serif",
  },
  {
    id: 'barlow-condensed',
    label: 'Barlow Condensed（省幅スポーツ・詰）',
    tag: '長体 / 非等幅',
    family: "'Barlow Condensed', sans-serif",
  },
];

export const UI_FONT_MAP = Object.fromEntries(UI_FONT_OPTIONS.map((f) => [f.id, f]));
export const MONO_FONT_MAP = Object.fromEntries(MONO_FONT_OPTIONS.map((f) => [f.id, f]));

export function resolveUiFontFamily(id) {
  return (UI_FONT_MAP[id] || UI_FONT_OPTIONS[0]).family;
}

export function resolveMonoFontFamily(id) {
  return (MONO_FONT_MAP[id] || MONO_FONT_OPTIONS[0]).family;
}
