'use client';

import { useState } from 'react';
import { MONO_FONT_OPTIONS, UI_FONT_OPTIONS } from '@/design-versions/fonts';
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
  onResetAllRadiusZero,
  onChangeUiFont,
  onChangeMonoFont,
}) {
  const [editMode, setEditMode] = useState('light');
  const [fontTab, setFontTab] = useState('mono');
  const activeColors = version.themes?.[editMode] || version.themes.light;
  const shape = version.shape || {};
  const activeUiFont = version.fonts?.ui || 'ibm-plex-sans-jp';
  const activeMonoFont = version.fonts?.mono || 'ibm-plex-mono';

  return (
    <section className="lab-section" id="tokens">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 01 // FOUNDATION TOKENS &amp; FONTS</span>
          <h2 className="lab-section-title">背景・角丸統一・フォント比較ラボ</h2>
          <p className="lab-section-desc">
            外枠・内側・ボタン/チップの角丸をトークンで一括制御し、日本語フォント8種・等幅/数字フォント16種を実データ表記で一発比較・採用できます。
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

          <div className="editor-subhead-row">
            <h3 className="editor-subhead">形状・角丸パラメータ</h3>
            <button
              type="button"
              className="ctrl-btn is-xs"
              onClick={onResetAllRadiusZero}
              title="カード・内側・ボタン/チップの角丸を一括で0pxにする"
            >
              角丸すべて 0px
            </button>
          </div>

          <div className="shape-sliders">
            <label className="slider-row">
              <span>カード角丸</span>
              <input
                type="range"
                min="0"
                max="24"
                value={shape.cardRadius ?? 0}
                onChange={(e) => onUpdateShape('cardRadius', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.cardRadius ?? 0}px</output>
            </label>
            <label className="slider-row">
              <span>内側角丸</span>
              <input
                type="range"
                min="0"
                max="16"
                value={shape.innerRadius ?? 0}
                onChange={(e) => onUpdateShape('innerRadius', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.innerRadius ?? 0}px</output>
            </label>
            <label className="slider-row">
              <span>部品角丸</span>
              <input
                type="range"
                min="0"
                max="16"
                value={shape.badgeRadius ?? 0}
                onChange={(e) => onUpdateShape('badgeRadius', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.badgeRadius ?? 0}px</output>
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
                value={shape.blur ?? 4}
                onChange={(e) => onUpdateShape('blur', Number(e.target.value))}
              />
              <output className="num-tabular">{shape.blur ?? 4}px</output>
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
                  <div className="font-compare-head">
                    <div>
                      <span className="typo-meta">FONT COMPARISON MATRIX</span>
                      <h4 className="typo-h4">フォント一覧比較（クリックで即適用）</h4>
                    </div>
                    <div className="ctrl-segmented">
                      <button
                        type="button"
                        className={fontTab === 'mono' ? 'is-active' : ''}
                        onClick={() => setFontTab('mono')}
                      >
                        等幅・数字 ({MONO_FONT_OPTIONS.length})
                      </button>
                      <button
                        type="button"
                        className={fontTab === 'ui' ? 'is-active' : ''}
                        onClick={() => setFontTab('ui')}
                      >
                        UI・日本語 ({UI_FONT_OPTIONS.length})
                      </button>
                      <button
                        type="button"
                        className={fontTab === 'otellia' ? 'is-active' : ''}
                        onClick={() => setFontTab('otellia')}
                      >
                        OTELLIA固有
                      </button>
                    </div>
                  </div>

                  {fontTab === 'mono' && (
                    <div className="font-compare-list">
                      {MONO_FONT_OPTIONS.map((font) => {
                        const isSelected = activeMonoFont === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            className={`font-compare-row ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => onChangeMonoFont(font.id)}
                          >
                            <div className="font-row-meta">
                              <span className="font-row-name">{font.label}</span>
                              <span className="font-row-tag">{font.tag}</span>
                              {isSelected && <span className="adopted-tag">採用中</span>}
                            </div>
                            <div
                              className="font-row-sample is-mono"
                              style={{ fontFamily: font.family }}
                            >
                              <span>COST 200</span>
                              <span>HP 29113</span>
                              <span>ATK 18847</span>
                              <span className="sample-digits">0123456789</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {fontTab === 'ui' && (
                    <div className="font-compare-list">
                      {UI_FONT_OPTIONS.map((font) => {
                        const isSelected = activeUiFont === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            className={`font-compare-row ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => onChangeUiFont(font.id)}
                          >
                            <div className="font-row-meta">
                              <span className="font-row-name">{font.label}</span>
                              <span className="font-row-tag">{font.tag}</span>
                              {isSelected && <span className="adopted-tag">採用中</span>}
                            </div>
                            <div
                              className="font-row-sample is-ui"
                              style={{ fontFamily: font.family }}
                            >
                              <strong>混合：マナデッキ / 基本デッキ・シーズン専用</strong>
                              <span>オーラ２枚と回復連打で耐久。先攻は辺置きでＨＰ維持し、終盤ゼウスコンボで詰め切る</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {fontTab === 'otellia' && (
                    <div className="typo-row">
                      <span className="typo-meta">DISPLAY // OTELLIA FONT</span>
                      <div className="typo-otellia">OTELLIA LAB 01 / 逆転オセロニア</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
