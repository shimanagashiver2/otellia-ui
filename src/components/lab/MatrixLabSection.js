'use client';

import { useState } from 'react';
import { RARITY_BORDER_PRESETS } from '@/design-versions/defaults';
import { SAMPLE_DECKS, RARITY_BUCKETS, ATTR_LABELS } from '@/data/sampleDecks';
import SubPieceMatrix from './SubPieceMatrix';
import PreviewSplitWrapper from './PreviewSplitWrapper';

const ATTRS = ['god', 'devil', 'dragon'];

export default function MatrixLabSection({
  version,
  themeMode,
  viewportWidth,
  onUpdateAttributeColor,
  onUpdateRarityBorderColor,
  onApplyRarityPreset,
  onUpdateMatrixConfig,
}) {
  const [editMode, setEditMode] = useState('light');
  const attrs = version.attributes?.[editMode] || version.attributes.light;
  const rarity = version.rarityBorders?.[editMode] || version.rarityBorders.light;
  const matrix = version.matrix || {};

  return (
    <section className="lab-section" id="matrix">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 03 // 4×4 SUB PIECE MATRIX</span>
          <h2 className="lab-section-title">左上空き 4×4 ブロック &amp; 属性×レアリティ配色</h2>
          <p className="lab-section-desc">
            4×4マトリクスの左上（リーダー分）を空白にし、残り15マスを「塗り＝属性（神/魔/竜）」「枠線＝レアリティ（S/A/B/C）」で表示する視認性テストです。
          </p>
        </div>
      </div>

      <div className="lab-panel-grid">
        <div className="lab-editor-card">
          <div className="editor-card-head">
            <h3>色＆サイズ調整</h3>
            <div className="ctrl-segmented" role="group" aria-label="マトリクス編集対象テーマ">
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

          <h4 className="editor-subhead">塗り：属性カラー</h4>
          <div className="token-color-grid is-compact">
            {ATTRS.map((attr) => (
              <label key={attr} className="token-color-item">
                <span className="token-color-label">{ATTR_LABELS[attr]} ({attr})</span>
                <div className="token-color-inputs">
                  <input
                    type="color"
                    value={attrs[attr]}
                    onChange={(e) => onUpdateAttributeColor(editMode, attr, e.target.value)}
                  />
                  <input
                    type="text"
                    value={attrs[attr]}
                    onChange={(e) => onUpdateAttributeColor(editMode, attr, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="editor-divider" />

          <div className="editor-subhead-row">
            <h4 className="editor-subhead">線：レアリティ枠線カラー</h4>
            <div className="preset-btn-row">
              {Object.entries(RARITY_BORDER_PRESETS).map(([presetKey, preset]) => (
                <button
                  key={presetKey}
                  type="button"
                  className="ctrl-btn is-xs"
                  onClick={() => onApplyRarityPreset(preset)}
                >
                  {preset.label.split('（')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="token-color-grid is-compact">
            {[...RARITY_BUCKETS, 'empty'].map((bucket) => (
              <label key={bucket} className="token-color-item">
                <span className="token-color-label">
                  {bucket === 'empty' ? '空き枠 (破線)' : `${bucket}枠 (${bucket === 'S' ? 'S/S+' : bucket === 'A' ? 'A/A+' : bucket})`}
                </span>
                <div className="token-color-inputs">
                  <input
                    type="color"
                    value={rarity[bucket]}
                    onChange={(e) => onUpdateRarityBorderColor(editMode, bucket, e.target.value)}
                  />
                  <input
                    type="text"
                    value={rarity[bucket]}
                    onChange={(e) => onUpdateRarityBorderColor(editMode, bucket, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="editor-divider" />

          <h4 className="editor-subhead">ブロック形状・左上空白表示</h4>
          <div className="shape-sliders">
            <label className="slider-row">
              <span>マスサイズ</span>
              <input
                type="range"
                min="8"
                max="20"
                value={matrix.cellSize ?? 13}
                onChange={(e) => onUpdateMatrixConfig('cellSize', Number(e.target.value))}
              />
              <output className="num-tabular">{matrix.cellSize ?? 13}px</output>
            </label>
            <label className="slider-row">
              <span>マス間隔</span>
              <input
                type="range"
                min="1"
                max="6"
                value={matrix.gap ?? 3}
                onChange={(e) => onUpdateMatrixConfig('gap', Number(e.target.value))}
              />
              <output className="num-tabular">{matrix.gap ?? 3}px</output>
            </label>
            <label className="slider-row">
              <span>枠線太さ</span>
              <input
                type="range"
                min="1"
                max="4"
                value={matrix.borderWidth ?? 2}
                onChange={(e) => onUpdateMatrixConfig('borderWidth', Number(e.target.value))}
              />
              <output className="num-tabular">{matrix.borderWidth ?? 2}px</output>
            </label>
            <label className="slider-row">
              <span>角丸</span>
              <input
                type="range"
                min="0"
                max="6"
                value={matrix.radius ?? 3}
                onChange={(e) => onUpdateMatrixConfig('radius', Number(e.target.value))}
              />
              <output className="num-tabular">{matrix.radius ?? 3}px</output>
            </label>
          </div>

          <div className="marker-choice-row">
            <span>左上の空き枠表現：</span>
            <div className="ctrl-segmented">
              {[
                { id: 'blank', label: '完全空白' },
                { id: 'dot', label: '極小ドット' },
                { id: 'L', label: 'L表記' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={matrix.leaderMarker === m.id ? 'is-active' : ''}
                  onClick={() => onUpdateMatrixConfig('leaderMarker', m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lab-preview-wrap">
          <PreviewSplitWrapper
            version={version}
            themeMode={themeMode}
            viewportWidth={viewportWidth}
            renderContent={() => (
              <div className="matrix-lab-preview">
                <div className="matrix-specimen-card">
                  <div className="matrix-specimen-head">
                    <h4>全12通り（3属性 × 4レアリティ）視認性表</h4>
                    <span className="matrix-note">上段＝実寸 / 下段＝拡大確認</span>
                  </div>

                  <div className="matrix-combo-table">
                    <div className="combo-row is-header">
                      <span />
                      {RARITY_BUCKETS.map((b) => (
                        <span key={b} className="combo-col-title">
                          {b}
                        </span>
                      ))}
                      <span className="combo-col-title">空き</span>
                    </div>

                    {ATTRS.map((attr) => (
                      <div key={attr} className="combo-row">
                        <span className="combo-row-title">{ATTR_LABELS[attr]}</span>
                        {RARITY_BUCKETS.map((b) => (
                          <div key={`${attr}-${b}`} className="combo-cell-pair">
                            <span
                              className={`matrix-cell attr-${attr} rarity-${b.toLowerCase()}`}
                              title={`${ATTR_LABELS[attr]} / ${b}`}
                            />
                            <span
                              className={`matrix-cell is-zoomed attr-${attr} rarity-${b.toLowerCase()}`}
                              title={`${ATTR_LABELS[attr]} / ${b} (拡大)`}
                            />
                          </div>
                        ))}
                        <div className="combo-cell-pair">
                          <span className="matrix-cell is-empty" />
                          <span className="matrix-cell is-zoomed is-empty" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="matrix-specimen-card">
                  <div className="matrix-specimen-head">
                    <h4>実デッキパターン比較（6デッキ）</h4>
                    <span className="matrix-note">マウスホバーで駒名・レアリティ・印を表示</span>
                  </div>
                  <div className="matrix-decks-sample">
                    {SAMPLE_DECKS.map((deck) => (
                      <div key={deck.id} className="matrix-deck-sample-item">
                        <SubPieceMatrix
                          subs={deck.subs}
                          leaderMarker={matrix.leaderMarker || 'blank'}
                        />
                        <div className="matrix-sample-meta">
                          <strong>{deck.name}</strong>
                          <span className="num-tabular">
                            {deck.subs.filter(Boolean).length}/15 subs
                          </span>
                        </div>
                      </div>
                    ))}
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
