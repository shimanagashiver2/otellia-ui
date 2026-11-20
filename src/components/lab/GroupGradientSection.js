'use client';

import { useState } from 'react';
import { GROUP_ITEMS, SAMPLE_DECKS } from '@/data/sampleDecks';
import { buildGradientCss, resolveGroupTextColor } from '@/lib/gradient';
import DeckCardVariant from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';

const APPLY_MODES = [
  { id: 'title-band', label: 'タイトル帯' },
  { id: 'left-bar', label: '左端カラー帯' },
  { id: 'top-bar', label: '上端ライン帯' },
  { id: 'tinted', label: '左帯＋極薄ティント' },
];

export default function GroupGradientSection({
  version,
  themeMode,
  viewportWidth,
  onUpdateGroupGradient,
  onChangeGroupApplyMode,
}) {
  const [selectedKey, setSelectedKey] = useState('2');
  const [copiedCss, setCopiedCss] = useState(false);

  const selectedGroup = GROUP_ITEMS.find((g) => g.key === selectedKey) || GROUP_ITEMS[0];
  const cfg = version.groupGradients?.[selectedGroup.key] || {
    start: '#0ea5e9',
    mid: '#38bdf8',
    useMid: false,
    end: '#2563eb',
    angle: 135,
    textColor: 'auto',
  };

  const sampleDeckForGroup = {
    ...SAMPLE_DECKS[1],
    name: `${selectedGroup.label} サンプル`,
    groupKey: selectedGroup.key,
  };

  const handleCopyAll = async () => {
    const css = GROUP_ITEMS.map((g) => {
      const item = version.groupGradients[g.key];
      return `--group-gradient-${g.key}: ${buildGradientCss(item)}; /* ${g.label} */\n--group-text-${g.key}: ${resolveGroupTextColor(item)};`;
    }).join('\n');
    try {
      await navigator.clipboard.writeText(css);
      setCopiedCss(true);
      window.setTimeout(() => setCopiedCss(false), 1800);
    } catch {}
  };

  return (
    <section className="lab-section" id="gradients">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 04 // GROUP GRADIENTS</span>
          <h2 className="lab-section-title">デッキグループ11種 グラデーションビルダー</h2>
          <p className="lab-section-desc">
            基本・カップ戦・シーズン・白の塔・闘技場A/B/C・ロイヤル・グローリーなど全11グループのグラデーションとカード適用位置を設計します。
          </p>
        </div>
        <div className="section-head-actions">
          <button type="button" className="ctrl-btn is-primary" onClick={handleCopyAll}>
            {copiedCss ? 'コピー完了！' : '11種CSS変数をコピー'}
          </button>
        </div>
      </div>

      <div className="lab-panel-grid">
        <div className="lab-editor-card">
          <div className="editor-card-head">
            <h3>グループ選択（全11種）</h3>
          </div>

          <div className="group-swatch-list">
            {GROUP_ITEMS.map((g) => {
              const gCfg = version.groupGradients?.[g.key];
              const gradCss = buildGradientCss(gCfg);
              const txt = resolveGroupTextColor(gCfg);
              const isSelected = g.key === selectedKey;
              return (
                <button
                  key={g.key}
                  type="button"
                  className={`group-swatch-btn ${isSelected ? 'is-active' : ''}`}
                  onClick={() => setSelectedKey(g.key)}
                >
                  <span
                    className="group-swatch-bar"
                    style={{ background: gradCss, color: txt }}
                  >
                    {g.key.toUpperCase()}
                  </span>
                  <span className="group-swatch-info">
                    <strong>{g.label}</strong>
                    <small>{g.defaultRule}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="editor-divider" />

          <div className="editor-card-head">
            <h3>編集中：{selectedGroup.label} (ID: {selectedGroup.key})</h3>
          </div>

          <div
            className="gradient-live-banner"
            style={{
              background: buildGradientCss(cfg),
              color: resolveGroupTextColor(cfg),
            }}
          >
            <span>{selectedGroup.label}</span>
            <small className="num-tabular">{cfg.angle}°</small>
          </div>

          <div className="gradient-controls-grid">
            <label className="token-color-item">
              <span className="token-color-label">開始色 (Start)</span>
              <div className="token-color-inputs">
                <input
                  type="color"
                  value={cfg.start}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'start', e.target.value)
                  }
                />
                <input
                  type="text"
                  value={cfg.start}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'start', e.target.value)
                  }
                />
              </div>
            </label>

            <label className="token-color-item">
              <span className="token-color-label">終了色 (End)</span>
              <div className="token-color-inputs">
                <input
                  type="color"
                  value={cfg.end}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'end', e.target.value)
                  }
                />
                <input
                  type="text"
                  value={cfg.end}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'end', e.target.value)
                  }
                />
              </div>
            </label>
          </div>

          <div className="gradient-mid-row">
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={Boolean(cfg.useMid)}
                onChange={(e) =>
                  onUpdateGroupGradient(selectedGroup.key, 'useMid', e.target.checked)
                }
              />
              <span>中間色（3色グラデ）を使う</span>
            </label>
            {cfg.useMid && (
              <div className="token-color-inputs is-inline">
                <input
                  type="color"
                  value={cfg.mid || cfg.start}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'mid', e.target.value)
                  }
                />
                <input
                  type="text"
                  value={cfg.mid || cfg.start}
                  onChange={(e) =>
                    onUpdateGroupGradient(selectedGroup.key, 'mid', e.target.value)
                  }
                />
              </div>
            )}
          </div>

          <div className="shape-sliders">
            <label className="slider-row">
              <span>角度</span>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={cfg.angle ?? 135}
                onChange={(e) =>
                  onUpdateGroupGradient(selectedGroup.key, 'angle', Number(e.target.value))
                }
              />
              <output className="num-tabular">{cfg.angle ?? 135}°</output>
            </label>
          </div>

          <div className="gradient-quick-row">
            <div className="ctrl-segmented">
              {[90, 135, 180].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  className={cfg.angle === deg ? 'is-active' : ''}
                  onClick={() => onUpdateGroupGradient(selectedGroup.key, 'angle', deg)}
                >
                  {deg}°
                </button>
              ))}
            </div>
            <div className="ctrl-segmented" aria-label="バッジ文字色">
              {[
                { id: 'auto', label: '文字自動' },
                { id: '#f8fafc', label: '白' },
                { id: '#0f172a', label: '黒' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={(cfg.textColor || 'auto') === t.id ? 'is-active' : ''}
                  onClick={() => onUpdateGroupGradient(selectedGroup.key, 'textColor', t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-divider" />

          <div className="apply-mode-row">
            <span className="editor-subhead">カードへのグラデーション適用方式</span>
            <div className="ctrl-segmented">
              {APPLY_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={version.groupApplyMode === m.id ? 'is-active' : ''}
                  onClick={() => onChangeGroupApplyMode(m.id)}
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
              <div className="gradient-preview-stack">
                <div className="gradient-card-preview-box">
                  <div className="preview-subcaption">
                    適用中カードイメージ（{selectedGroup.label} / {version.groupApplyMode}）
                  </div>
                  <DeckCardVariant
                    deck={sampleDeckForGroup}
                    pattern={version.cardPattern}
                    groupApplyMode={version.groupApplyMode}
                    leaderMarker={version.matrix?.leaderMarker || 'dot'}
                    cardMixer={version.cardMixer}
                  />
                </div>

                <div className="gradient-all-badges-card">
                  <div className="preview-subcaption">全11グループ 一覧視認性チェック</div>
                  <div className="all-group-chips-grid">
                    {GROUP_ITEMS.map((g) => {
                      const active = g.key === selectedKey;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => setSelectedKey(g.key)}
                          className={`group-preview-chip ${active ? 'is-selected' : ''}`}
                          style={{
                            '--chip-grad': `var(--group-gradient-${g.key})`,
                            '--chip-text': `var(--group-text-${g.key})`,
                          }}
                        >
                          <span className="chip-bar" />
                          <span className="chip-pill">{g.short}</span>
                          <span className="chip-label">{g.label}</span>
                        </button>
                      );
                    })}
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
