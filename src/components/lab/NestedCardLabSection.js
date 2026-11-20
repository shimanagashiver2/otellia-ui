'use client';

import { useCallback, useState } from 'react';
import { SAMPLE_DECKS } from '@/data/sampleDecks';
import DeckCardVariant, { CARD_PATTERNS } from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';

const GROUP_APPLY_OPTIONS = [
  { id: 'title-band', label: 'タイトル帯' },
  { id: 'left-bar', label: '左端縦帯' },
  { id: 'top-bar', label: '上端細帯' },
  { id: 'tinted', label: '左帯＋極薄面' },
];

export default function NestedCardLabSection({
  version,
  themeMode,
  viewportWidth,
  onSelectCardPattern,
  onChangeGroupApplyMode,
  onUpdateMatrixConfig,
  onUpdateCardMixer,
}) {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [heights, setHeights] = useState({});

  const sampleDeck = SAMPLE_DECKS[sampleIndex] || SAMPLE_DECKS[0];
  const baselineHeight = heights.legacy || null;
  const cardMixer = version.cardMixer || {};
  const cardCellSize = version.matrix?.cardCellSize ?? 11;

  const handleMeasure = useCallback((patternId, px) => {
    setHeights((prev) => (prev[patternId] === px ? prev : { ...prev, [patternId]: px }));
  }, []);

  return (
    <section className="lab-section" id="nested">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 02 // CARD ARCHITECTURE &amp; MIXER</span>
          <h2 className="lab-section-title">入れ子脱却 6パターン比較 &amp; パーツ別ミキサー</h2>
          <p className="lab-section-desc">
            重複ピル・不要なSLOTS表示・無駄空白を撤廃し、40文字コメントを375pxでも省略なしで表示。パーツ別ミキサーで要素を混ぜて縦幅実測を比較できます。
          </p>
        </div>
        <div className="section-head-actions">
          <label className="inline-select-label">
            <span>検証デッキ (40文字コメント)</span>
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

      {/* パーツ別ミキサー */}
      <div className="mixer-bar">
        <div className="mixer-item">
          <span className="ctrl-label">GROUP色</span>
          <div className="ctrl-segmented">
            {GROUP_APPLY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={version.groupApplyMode === opt.id ? 'is-active' : ''}
                onClick={() => onChangeGroupApplyMode(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mixer-item">
          <span className="ctrl-label">リーダー×4×4配置</span>
          <div className="ctrl-segmented">
            {[
              { id: 'stacked', label: '縦積み' },
              { id: 'inline', label: '横並び' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={(cardMixer.visualLayout || 'stacked') === opt.id ? 'is-active' : ''}
                onClick={() => onUpdateCardMixer('visualLayout', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="mixer-item is-range">
          <span className="ctrl-label">カード内4×4</span>
          <input
            type="range"
            min="8"
            max="15"
            value={cardCellSize}
            onChange={(e) => onUpdateMatrixConfig('cardCellSize', Number(e.target.value))}
          />
          <output className="num-tabular">{cardCellSize}px</output>
        </label>

        <div className="mixer-item">
          <span className="ctrl-label">コメント</span>
          <div className="ctrl-segmented">
            {[10, 11, 12].map((sz) => (
              <button
                key={sz}
                type="button"
                className={(cardMixer.commentSize ?? 11) === sz ? 'is-active' : ''}
                onClick={() => onUpdateCardMixer('commentSize', sz)}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={cardMixer.showMetaLine !== false}
            onChange={(e) => onUpdateCardMixer('showMetaLine', e.target.checked)}
          />
          <span>ID・日時行を表示</span>
        </label>
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
                    leaderMarker={version.matrix?.leaderMarker || 'dot'}
                    cardMixer={cardMixer}
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
