'use client';

import { useState } from 'react';
import PreviewSplitWrapper from './PreviewSplitWrapper';

function toPickerHex(value, fallback = '#ffffff') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
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

const COLOR_FIELDS = [
  { key: 'bg', label: '全体背景 (bg)' },
  { key: 'surface1', label: 'カード面 (surface1)' },
  { key: 'surface2', label: 'サブ面 (surface2)' },
  { key: 'surfaceSubtle', label: '極薄面 (subtle)' },
  { key: 'border', label: '境界線 (border)' },
  { key: 'borderStrong', label: '強境界 (strong)' },
  { key: 'text', label: '本文文字 (text)' },
  { key: 'textMuted', label: '補助文字 (muted)' },
  { key: 'accent', label: 'アクセント (accent)' },
];

export default function TokensSection({
  version,
  themeMode,
  viewportWidth,
  onUpdateThemeColor,
  onUpdateShape,
}) {
  const [editMode, setEditMode] = useState('light');
  const activeColors = version.themes?.[editMode] || version.themes.light;
  const shape = version.shape || {};

  return (
    <section className="lab-section" id="tokens">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 01 // FOUNDATION TOKENS</span>
          <h2 className="lab-section-title">背景・サーフェス階層・タイポグラフィ</h2>
          <p className="lab-section-desc">
            OTELLIAのベース色温度を保ちつつ、面（Surface）と1px罫線のバランスや角丸・ぼかし量をリアルタイムで検証します。
          </p>
        </div>
      </div>

      <div className="lab-panel-grid">
        <div className="lab-editor-card">
          <div className="editor-card-head">
            <h3>カラートークン調整</h3>
            <div className="ctrl-segmented" role="group" aria-label="編集対象テーマ">
              <button
                type="button"
                className={editMode === 'light' ? 'is-active' : ''}
                onClick={() => setEditMode('light')}
              >
                Light 編集
              </button>
              <button
                type="button"
                className={editMode === 'dark' ? 'is-active' : ''}
                onClick={() => setEditMode('dark')}
              >
                Dark 編集
              </button>
            </div>
          </div>

          <div className="token-color-grid">
            {COLOR_FIELDS.map((field) => {
              const rawVal = activeColors[field.key] || '#000000';
              return (
                <label key={field.key} className="token-color-item">
                  <span className="token-color-label">{field.label}</span>
                  <div className="token-color-inputs">
                    <input
                      type="color"
                      value={toPickerHex(rawVal)}
                      onChange={(e) => onUpdateThemeColor(editMode, field.key, e.target.value)}
                    />
                    <input
                      type="text"
                      value={rawVal}
                      onChange={(e) => onUpdateThemeColor(editMode, field.key, e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                </label>
              );
            })}
          </div>

          <div className="editor-divider" />

          <h3 className="editor-subhead">形状・質感パラメータ</h3>
          <div className="shape-sliders">
            <label className="slider-row">
              <span>カード角丸</span>
              <input
                type="range"
                min="0"
                max="24"
                value={shape.cardRadius ?? 12}
                onChange={(e) => onUpdateShape('cardRadius', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.cardRadius ?? 12}px</output>
            </label>
            <label className="slider-row">
              <span>内側角丸</span>
              <input
                type="range"
                min="0"
                max="16"
                value={shape.innerRadius ?? 8}
                onChange={(e) => onUpdateShape('innerRadius', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.innerRadius ?? 8}px</output>
            </label>
            <label className="slider-row">
              <span>枠線太さ</span>
              <input
                type="range"
                min="1"
                max="3"
                value={shape.borderWidth ?? 1}
                onChange={(e) => onUpdateShape('borderWidth', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.borderWidth ?? 1}px</output>
            </label>
            <label className="slider-row">
              <span>ガラスぼかし</span>
              <input
                type="range"
                min="0"
                max="18"
                value={shape.blur ?? 0}
                onChange={(e) => onUpdateShape('blur', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.blur ?? 0}px</output>
            </label>
          </div>
        </div>

        <div className="lab-preview-wrap">
          <PreviewSplitWrapper
            version={version}
            themeMode={themeMode}
            viewportWidth={viewportWidth}
            renderContent={() => (
              <div className="token-specimen">
                <div className="specimen-surface-stack">
                  <div className="surface-box is-s1">
                    <div className="surface-tag">Surface 1 (Primary Card)</div>
                    <div className="surface-box is-s2">
                      <div className="surface-tag">Surface 2 (Elevated / Section)</div>
                      <div className="surface-box is-subtle">
                        <div className="surface-tag">Surface Subtle (Inset / Header Band)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="specimen-typo-card">
                  <div className="typo-row">
                    <span className="typo-meta">DISPLAY // OTELLIA FONT</span>
                    <div className="typo-otellia">OTELLIA LAB 01</div>
                  </div>
                  <div className="typo-row">
                    <span className="typo-meta">HEADING &amp; BODY</span>
                    <h4 className="typo-h4">逆転オセロニア 研究解析コンソール</h4>
                    <p className="typo-body">
                      装飾を極力抑えた研究機関ベースの面階層に、属性色とグループグラデーションだけをデータ信号として乗せる設計です。
                    </p>
                  </div>
                  <div className="typo-row">
                    <span className="typo-meta">TABULAR NUMBERS (等幅数値)</span>
                    <div className="typo-nums num-tabular">
                      <span>HP 28,450</span>
                      <span>ATK 17,920</span>
                      <span>COST 200 / 200</span>
                    </div>
                  </div>
                  <div className="typo-status-row">
                    <span className="status-pill is-accent">ACCENT</span>
                    <span className="status-pill is-success">OK / 適合</span>
                    <span className="status-pill is-warning">COST調整</span>
                    <span className="status-pill is-danger">上限超過</span>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
