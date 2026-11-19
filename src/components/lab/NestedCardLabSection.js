'use client';

import { useCallback, useState } from 'react';
import { SAMPLE_DECKS } from '@/data/sampleDecks';
import DeckCardVariant, { CARD_PATTERNS } from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';

export default function NestedCardLabSection({
  version,
  themeMode,
  viewportWidth,
  onSelectCardPattern,
}) {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [heights, setHeights] = useState({});

  const sampleDeck = SAMPLE_DECKS[sampleIndex] || SAMPLE_DECKS[0];
  const baselineHeight = heights.legacy || null;

  const handleMeasure = useCallback((patternId, px) => {
    setHeights((prev) => (prev[patternId] === px ? prev : { ...prev, [patternId]: px }));
  }, []);

  return (
    <section className="lab-section" id="nested">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 02 // CARD ARCHITECTURE</span>
          <h2 className="lab-section-title">入れ子カード脱却比較ラボ（6パターン）</h2>
          <p className="lab-section-desc">
            現行の左2px線「status-cell」入れ子構造を廃止し、縦幅を増やさずに文字・数字・4×4サブ駒ブロック・グループ色を見やすくする5つの代替案を実測高さ付きで比較します。
          </p>
        </div>
        <div className="section-head-actions">
          <label className="inline-select-label">
            <span>検証デッキ</span>
            <select
              className="ctrl-select"
              value={sampleIndex}
              onChange={(e) => setSampleIndex(Number(e.target.value))}
            >
              {SAMPLE_DECKS.map((d, i) => (
                <option key={d.id} value={i}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="nested-patterns-grid">
            {CARD_PATTERNS.map((pat) => {
              const isAdopted = version.cardPattern === pat.id;
              return (
                <div
                  key={pat.id}
                  className={`pattern-showcase-item ${isAdopted ? 'is-adopted' : ''}`}
                >
                  <div className="pattern-showcase-head">
                    <div>
                      <div className="pattern-title-line">
                        <strong>{pat.label}</strong>
                        {isAdopted && <span className="adopted-tag">採用中</span>}
                      </div>
                      <p className="pattern-summary">{pat.summary}</p>
                    </div>
                    <button
                      type="button"
                      className={`ctrl-btn ${isAdopted ? 'is-primary' : ''}`}
                      onClick={() => onSelectCardPattern(pat.id)}
                    >
                      {isAdopted ? '採用中' : 'これを採用'}
                    </button>
                  </div>

                  <DeckCardVariant
                    deck={sampleDeck}
                    pattern={pat.id}
                    groupApplyMode={version.groupApplyMode}
                    leaderMarker={version.matrix?.leaderMarker || 'blank'}
                    baselineHeight={baselineHeight}
                    showMeasure
                    onHeightMeasured={(px) => handleMeasure(pat.id, px)}
                  />
                </div>
              );
            })}
          </div>
        )}
      />
    </section>
  );
}
