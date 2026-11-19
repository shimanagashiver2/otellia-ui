'use client';

import { useState } from 'react';
import {
  GROUP_ITEMS,
  RARITY_BUCKETS,
  SAMPLE_DECKS,
  SEAL_NAME_MAP,
  calcDeckSummary,
  getRarityBucket,
  getSampleChar,
  getSealLabel,
} from '@/data/sampleDecks';
import { assetPath, pieceImageUrl } from '@/lib/assetPath';
import DeckCardVariant from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';

const COST_LIMIT_OPTIONS = Array.from({ length: 15 }, (_, i) => 150 + i * 5); // 150..220 (5刻み)

const INITIAL_MODIFIERS = [
  { id: 'mod-1', sealId: 2, rarityBucket: 'S', delta: -2 },
  { id: 'mod-2', sealId: 2, rarityBucket: 'A', delta: 1 },
];

export default function DeckPreviewSection({
  version,
  themeMode,
  viewportWidth,
}) {
  const [groupFilter, setGroupFilter] = useState('all');
  const [activeEditorDeckId, setActiveEditorDeckId] = useState(SAMPLE_DECKS[1].id);
  const [costLimit, setCostLimit] = useState(180);
  const [maxSCount, setMaxSCount] = useState(3);
  const [maxBCount, setMaxBCount] = useState(1);
  const [modifiers, setModifiers] = useState(INITIAL_MODIFIERS);

  const [newSealId, setNewSealId] = useState(6);
  const [newRarity, setNewRarity] = useState('S');
  const [newDelta, setNewDelta] = useState(-2);

  const filteredDecks =
    groupFilter === 'all'
      ? SAMPLE_DECKS
      : SAMPLE_DECKS.filter((d) => d.groupKey === groupFilter);

  const editorDeck =
    SAMPLE_DECKS.find((d) => d.id === activeEditorDeckId) || SAMPLE_DECKS[1];
  const editorStats = calcDeckSummary(editorDeck, modifiers);
  const all16Slots = [editorDeck.leaderId, ...editorDeck.subs];

  const isCostOver = editorStats.adjustedCost > costLimit;
  const isSOver = maxSCount !== 99 && editorStats.rarityCounts.S > maxSCount;
  const isBOver = maxBCount !== 99 && editorStats.rarityCounts.B > maxBCount;

  const addModifier = () => {
    setModifiers((prev) => {
      const existing = prev.find(
        (m) => m.sealId === Number(newSealId) && m.rarityBucket === newRarity
      );
      if (existing) {
        return prev.map((m) =>
          m.id === existing.id ? { ...m, delta: Number(newDelta) } : m
        );
      }
      return [
        ...prev,
        {
          id: `mod-${Date.now()}`,
          sealId: Number(newSealId),
          rarityBucket: newRarity,
          delta: Number(newDelta),
        },
      ];
    });
  };

  const removeModifier = (id) => {
    setModifiers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <section className="lab-section" id="deck-preview">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 05 // DECK WAREHOUSE &amp; EDITOR MOCK</span>
          <h2 className="lab-section-title">実戦プレビュー：マイデッキ一覧 &amp; コスト補正エディタ</h2>
          <p className="lab-section-desc">
            採用したカード構造・4×4ブロック・グループグラデーションを組み合わせた一覧画面と、5刻み上限＆印×レアリティ別コスト補正付きの編集モックです。
          </p>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="real-deck-lab">
            {/* Part A: マイデッキ倉庫一覧 */}
            <div className="mock-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <img
                    src={assetPath('/images/icons/mydeck.svg')}
                    alt=""
                    className="ui-icon"
                  />
                  <h3>マイデッキ倉庫プレビュー</h3>
                  <span className="count-badge num-tabular">{filteredDecks.length}</span>
                </div>

                <div className="group-filter-chips">
                  <button
                    type="button"
                    className={`filter-chip ${groupFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setGroupFilter('all')}
                  >
                    すべて
                  </button>
                  {['1', '2', '3', '9', 'a', '0'].map((key) => {
                    const item = GROUP_ITEMS.find((g) => g.key === key);
                    if (!item) return null;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`filter-chip ${groupFilter === key ? 'is-active' : ''}`}
                        onClick={() => setGroupFilter(key)}
                      >
                        {item.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="warehouse-preview-grid">
                {filteredDecks.map((deck) => (
                  <DeckCardVariant
                    key={deck.id}
                    deck={deck}
                    pattern={version.cardPattern}
                    groupApplyMode={version.groupApplyMode}
                    leaderMarker={version.matrix?.leaderMarker || 'blank'}
                    onSelectForEditor={(selected) => setActiveEditorDeckId(selected.id)}
                  />
                ))}
              </div>
            </div>

            {/* Part B: デッキ編集 & カップ戦コスト補正モック */}
            <div className="mock-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <img
                    src={assetPath('/images/icons/deckeditor.svg')}
                    alt=""
                    className="ui-icon"
                  />
                  <h3>デッキ編集 &amp; 印×レアリティ コスト補正モック</h3>
                </div>
                <select
                  className="ctrl-select"
                  value={editorDeck.id}
                  onChange={(e) => setActiveEditorDeckId(e.target.value)}
                  aria-label="編集モック対象デッキ"
                >
                  {SAMPLE_DECKS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ルール設定バー（5刻み上限 + S/B枚数制限） */}
              <div className="rule-toolbar">
                <label className="rule-field">
                  <span>コスト上限（5刻み）</span>
                  <select
                    className="ctrl-select"
                    value={costLimit}
                    onChange={(e) => setCostLimit(Number(e.target.value))}
                  >
                    {COST_LIMIT_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rule-field">
                  <span>S/S+ 上限</span>
                  <select
                    className="ctrl-select"
                    value={maxSCount}
                    onChange={(e) => setMaxSCount(Number(e.target.value))}
                  >
                    <option value={99}>制限なし</option>
                    <option value={2}>2枚まで</option>
                    <option value={3}>3枚まで</option>
                    <option value={4}>4枚まで</option>
                  </select>
                </label>

                <label className="rule-field">
                  <span>B 上限</span>
                  <select
                    className="ctrl-select"
                    value={maxBCount}
                    onChange={(e) => setMaxBCount(Number(e.target.value))}
                  >
                    <option value={99}>制限なし</option>
                    <option value={1}>1枚まで</option>
                    <option value={2}>2枚まで</option>
                    <option value={3}>3枚まで</option>
                  </select>
                </label>
              </div>

              {/* 印×レアリティ コスト補正チップ＆追加フォーム */}
              <div className="cost-modifier-panel">
                <div className="modifier-form-row">
                  <span className="modifier-title">印×レアリティ コスト補正</span>
                  <div className="modifier-inputs">
                    <select
                      className="ctrl-select"
                      value={newSealId}
                      onChange={(e) => setNewSealId(Number(e.target.value))}
                      aria-label="対象の印"
                    >
                      {Object.entries(SEAL_NAME_MAP).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}印
                        </option>
                      ))}
                      <option value={23}>印 #23（将来追加例）</option>
                    </select>

                    <select
                      className="ctrl-select"
                      value={newRarity}
                      onChange={(e) => setNewRarity(e.target.value)}
                      aria-label="対象レアリティ括り"
                    >
                      {RARITY_BUCKETS.map((b) => (
                        <option key={b} value={b}>
                          {b === 'S' ? 'S / S+' : b === 'A' ? 'A / A+' : b}
                        </option>
                      ))}
                    </select>

                    <select
                      className="ctrl-select"
                      value={newDelta}
                      onChange={(e) => setNewDelta(Number(e.target.value))}
                      aria-label="コスト増減"
                    >
                      {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d > 0 ? `+${d}` : d}
                        </option>
                      ))}
                    </select>

                    <button type="button" className="ctrl-btn is-primary" onClick={addModifier}>
                      補正追加
                    </button>
                  </div>
                </div>

                <div className="modifier-chips-row">
                  {modifiers.length === 0 ? (
                    <span className="modifier-empty">コスト補正ルールなし（通常ルール）</span>
                  ) : (
                    modifiers.map((mod) => (
                      <span
                        key={mod.id}
                        className={`modifier-chip ${mod.delta < 0 ? 'is-down' : 'is-up'}`}
                      >
                        <span>
                          {mod.rarityBucket} {getSealLabel(mod.sealId)}{' '}
                          <strong className="num-tabular">
                            {mod.delta > 0 ? `+${mod.delta}` : mod.delta}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeModifier(mod.id)}
                          aria-label="この補正を削除"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* 統合ステータスサマリー（入れ子なし・計器スタイル） */}
              <div className="editor-stats-strip">
                <div className={`editor-stat-block ${isCostOver ? 'is-error' : ''}`}>
                  <span className="lbl">COST (補正後 / 上限)</span>
                  <strong className="val num-tabular">
                    {editorStats.adjustedCost} / {costLimit}
                    {editorStats.adjustedCost !== editorStats.baseCost && (
                      <small> (素:{editorStats.baseCost})</small>
                    )}
                  </strong>
                </div>
                <div className="editor-stat-block">
                  <span className="lbl">TOTAL HP</span>
                  <strong className="val num-tabular">
                    {editorStats.totalHp.toLocaleString()}
                  </strong>
                </div>
                <div className="editor-stat-block">
                  <span className="lbl">TOTAL ATK</span>
                  <strong className="val num-tabular">
                    {editorStats.totalAtk.toLocaleString()}
                  </strong>
                </div>
                <div className={`editor-stat-block ${isSOver || isBOver ? 'is-error' : ''}`}>
                  <span className="lbl">RARITY CHECK</span>
                  <strong className="val num-tabular">
                    S:{editorStats.rarityCounts.S} / A:{editorStats.rarityCounts.A} / B:
                    {editorStats.rarityCounts.B} / C:{editorStats.rarityCounts.C}
                  </strong>
                </div>
              </div>

              {/* 16枠デッキグリッド */}
              <div className="editor-slots-grid">
                {all16Slots.map((charId, idx) => {
                  const ch = getSampleChar(charId);
                  if (!ch) {
                    return (
                      <div key={`slot-${idx}`} className="editor-slot is-empty">
                        <span className="slot-idx num-tabular">{idx + 1}</span>
                      </div>
                    );
                  }
                  const bucket = getRarityBucket(ch.rarity);
                  const delta = modifiers.reduce(
                    (acc, mod) =>
                      mod.sealId === ch.type && mod.rarityBucket === bucket
                        ? acc + mod.delta
                        : acc,
                    0
                  );
                  const effCost = Math.max(0, ch.cost + delta);
                  return (
                    <div
                      key={`slot-${idx}-${ch.id}`}
                      className="editor-slot"
                      title={`${ch.name} / ${getSealLabel(ch.type)}印 / ${ch.rarity} / Cost ${effCost}`}
                    >
                      <img
                        src={assetPath(`/images/bases/${ch.attr}.png`)}
                        alt=""
                        className="slot-base-img"
                      />
                      <img
                        src={pieceImageUrl(ch.id)}
                        alt={ch.name}
                        className="slot-char-img"
                      />
                      {idx === 0 && <span className="slot-leader-badge">L</span>}
                      <span
                        className={`slot-cost-badge num-tabular ${
                          delta < 0 ? 'is-down' : delta > 0 ? 'is-up' : ''
                        }`}
                      >
                        {effCost}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
}
