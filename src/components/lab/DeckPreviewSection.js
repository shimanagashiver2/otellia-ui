'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  GROUP_BY_KEY,
  GROUP_ITEMS,
  GROUP_RULE_SPECS,
  RARITY_BUCKETS,
  SAMPLE_CHARACTERS,
  SAMPLE_DECKS,
  SEAL_NAME_MAP,
  calcCharEffectiveCost,
  calcDeckSummary,
  getSampleChar,
  getSealLabel,
} from '@/data/sampleDecks';
import {
  getGroupNotesServerSnapshot,
  getGroupNotesSnapshot,
  subscribeGroupNotes,
  updateGroupNote,
} from '@/design-versions/labStore';
import { assetPath, pieceImageUrl } from '@/lib/assetPath';
import DeckCardVariant from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';

const COST_LIMIT_OPTIONS = Array.from({ length: 35 }, (_, i) => 150 + i * 5); // 150..320 (5刻み)

const INITIAL_SEAL_MODIFIERS = [
  { id: 'mod-1', sealId: 2, rarityBucket: 'S', delta: -2 },
  { id: 'mod-2', sealId: 2, rarityBucket: 'A', delta: 1 },
];

const INITIAL_CHAR_EXCEPTIONS = [
  { id: 'ex-1', charId: 8179, delta: -2 },
];

const ALL_SAMPLE_CHARS_LIST = Object.values(SAMPLE_CHARACTERS);

export default function DeckPreviewSection({
  version,
  themeMode,
  viewportWidth,
}) {
  const groupNotes = useSyncExternalStore(
    subscribeGroupNotes,
    getGroupNotesSnapshot,
    getGroupNotesServerSnapshot
  );

  // 倉庫フィルタ・検索・並び替え
  const [groupFilter, setGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');

  // 編集モック状態
  const [activeEditorDeckId, setActiveEditorDeckId] = useState(SAMPLE_DECKS[1].id);
  const [idInput, setIdInput] = useState(SAMPLE_DECKS[1].deckCode);
  const [editorGroupKey, setEditorGroupKey] = useState(SAMPLE_DECKS[1].groupKey);
  const [costLimit, setCostLimit] = useState(180);
  const [maxSCount, setMaxSCount] = useState(3);
  const [maxBCount, setMaxBCount] = useState(1);

  const [modifiers, setModifiers] = useState(INITIAL_SEAL_MODIFIERS);
  const [charExceptions, setCharExceptions] = useState(INITIAL_CHAR_EXCEPTIONS);

  const [newSealId, setNewSealId] = useState(6);
  const [newRarity, setNewRarity] = useState('S');
  const [newDelta, setNewDelta] = useState(-2);

  const [newExCharId, setNewExCharId] = useState(8167);
  const [newExDelta, setNewExDelta] = useState(-2);

  const filteredDecks = SAMPLE_DECKS.filter((d) => {
    if (groupFilter !== 'all' && d.groupKey !== groupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        d.name.toLowerCase().includes(q) || d.comment.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortKey === 'hp') {
      return calcDeckSummary(b).totalHp - calcDeckSummary(a).totalHp;
    }
    if (sortKey === 'atk') {
      return calcDeckSummary(b).totalAtk - calcDeckSummary(a).totalAtk;
    }
    if (sortKey === 'cost') {
      return calcDeckSummary(b).baseCost - calcDeckSummary(a).baseCost;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const editorDeck =
    SAMPLE_DECKS.find((d) => d.id === activeEditorDeckId) || SAMPLE_DECKS[1];
  const editorStats = calcDeckSummary(editorDeck, modifiers, charExceptions);
  const all16Slots = [editorDeck.leaderId, ...editorDeck.subs];

  const isCostOver = editorStats.adjustedCost > costLimit;
  const isSOver = maxSCount !== 99 && editorStats.rarityCounts.S > maxSCount;
  const isBOver = maxBCount !== 99 && editorStats.rarityCounts.B > maxBCount;

  const loadDeckIntoEditor = (deck) => {
    setActiveEditorDeckId(deck.id);
    setIdInput(deck.deckCode);
    setEditorGroupKey(deck.groupKey);
    const spec = GROUP_RULE_SPECS.find((s) => s.key === deck.groupKey);
    if (spec) setCostLimit(spec.defaultLimit);
  };

  const handleSelectEditorGroup = (key) => {
    setEditorGroupKey(key);
    const spec = GROUP_RULE_SPECS.find((s) => s.key === key);
    if (spec) setCostLimit(spec.defaultLimit);
  };

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

  const addCharException = () => {
    setCharExceptions((prev) => {
      const existing = prev.find((ex) => Number(ex.charId) === Number(newExCharId));
      if (existing) {
        return prev.map((ex) =>
          ex.id === existing.id ? { ...ex, delta: Number(newExDelta) } : ex
        );
      }
      return [
        ...prev,
        {
          id: `ex-${Date.now()}`,
          charId: Number(newExCharId),
          delta: Number(newExDelta),
        },
      ];
    });
  };

  return (
    <section className="lab-section" id="deck-preview">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">
            SECTION 05 // GROUP RULE MATRIX &amp; DECK WORKSPACE MOCK
          </span>
          <h2 className="lab-section-title">
            グループ仕様マップ・実戦倉庫・コスト補正エディタ
          </h2>
          <p className="lab-section-desc">
            デッキグループごとのコスト上限（最大320）と増減有無をグラフ整理し、実戦のマイデッキ倉庫と50桁ID読込・印＆キャラ例外コスト補正エディタを検証します。
          </p>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="real-deck-lab">
            {/* Part 0: デッキグループ仕様マップ & 上限グラフ */}
            <div className="mock-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <h3>デッキグループ別ルール仕様マップ（上限最大 320 スケール）</h3>
                </div>
                <span className="matrix-note">メモ欄はブラウザに保存され、仕様の洗い出しに使えます</span>
              </div>

              <div className="group-spec-table-wrap">
                <table className="group-spec-table">
                  <thead>
                    <tr>
                      <th>グループ</th>
                      <th>コスト上限グラフ（MAX 320）</th>
                      <th>印/キャラ増減</th>
                      <th>枚数・編成制限 / 仕様メモ（追記可）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GROUP_RULE_SPECS.map((spec) => {
                      const info = GROUP_BY_KEY[spec.key];
                      const defaultPct = Math.round((spec.defaultLimit / 320) * 100);
                      const maxPct = Math.round((spec.maxLimit / 320) * 100);
                      const noteVal =
                        groupNotes[spec.key] !== undefined
                          ? groupNotes[spec.key]
                          : spec.note;
                      return (
                        <tr key={spec.key}>
                          <td className="spec-group-col">
                            <span
                              className="spec-group-tag"
                              style={{
                                '--spec-grad': `var(--group-gradient-${spec.key})`,
                                '--spec-text': `var(--group-text-${spec.key})`,
                              }}
                            >
                              {info?.label}
                            </span>
                            <small className="num-tabular">ID:{spec.key}</small>
                          </td>
                          <td className="spec-graph-col">
                            <div className="spec-bar-track" aria-label={`上限 ${spec.maxLimit}`}>
                              {spec.maxLimit > spec.defaultLimit && (
                                <div
                                  className="spec-bar-range"
                                  style={{
                                    width: `${maxPct}%`,
                                    background: `var(--group-gradient-${spec.key})`,
                                  }}
                                />
                              )}
                              <div
                                className="spec-bar-fill"
                                style={{
                                  width: `${defaultPct}%`,
                                  background: `var(--group-gradient-${spec.key})`,
                                }}
                              />
                            </div>
                            <div className="spec-bar-meta num-tabular">
                              <span>{spec.limitType}</span>
                              <span>
                                {spec.defaultLimit === spec.maxLimit
                                  ? `${spec.defaultLimit}`
                                  : `標準${spec.defaultLimit}〜最大${spec.maxLimit}`}
                              </span>
                            </div>
                          </td>
                          <td className="spec-var-col">
                            <span
                              className={`spec-var-badge ${
                                spec.costVariation === 'なし' ? 'is-none' : 'is-has'
                              }`}
                            >
                              {spec.costVariation}
                            </span>
                            <small>{spec.deckRestriction}</small>
                          </td>
                          <td className="spec-note-col">
                            <input
                              type="text"
                              className="ui-input is-compact"
                              value={noteVal}
                              onChange={(e) => updateGroupNote(spec.key, e.target.value)}
                              aria-label={`${info?.label}の仕様メモ`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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

                <div className="warehouse-toolbar-right">
                  <input
                    type="search"
                    className="ui-input is-compact"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="デッキ名・コメント検索..."
                    aria-label="マイデッキ検索"
                  />
                  <select
                    className="ctrl-select"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    aria-label="並び替え"
                  >
                    <option value="date">保存日時順</option>
                    <option value="cost">コスト順</option>
                    <option value="hp">HP高い順</option>
                    <option value="atk">ATK高い順</option>
                  </select>
                </div>
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

              <div className="warehouse-preview-grid">
                {filteredDecks.map((deck) => (
                  <DeckCardVariant
                    key={deck.id}
                    deck={deck}
                    pattern={version.cardPattern}
                    groupApplyMode={version.groupApplyMode}
                    leaderMarker={version.matrix?.leaderMarker || 'dot'}
                    cardMixer={version.cardMixer}
                    onSelectForEditor={loadDeckIntoEditor}
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
                  <h3>デッキ編集 &amp; 50桁ID読込 / コスト補正モック</h3>
                </div>
                <select
                  className="ctrl-select"
                  value={editorDeck.id}
                  onChange={(e) => {
                    const found = SAMPLE_DECKS.find((d) => d.id === e.target.value);
                    if (found) loadDeckIntoEditor(found);
                  }}
                  aria-label="編集モック対象デッキ"
                >
                  {SAMPLE_DECKS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 50桁デッキID読込バー（省略表示＋クリア＋貼り付け＋読込） */}
              <div className="deck-id-bar">
                <input
                  type="text"
                  className="deck-id-input num-tabular"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder="50桁デッキIDをペースト..."
                  aria-label="デッキID入力欄"
                />
                {idInput && (
                  <button
                    type="button"
                    className="dc-icon-btn"
                    title="クリア"
                    onClick={() => setIdInput('')}
                  >
                    <img src={assetPath('/images/icons/close.svg')} alt="クリア" className="ui-icon" />
                  </button>
                )}
                <button
                  type="button"
                  className="dc-icon-btn"
                  title="貼り付け（デモID挿入）"
                  onClick={() => setIdInput(editorDeck.deckCode)}
                >
                  <img src={assetPath('/images/icons/paste.svg')} alt="貼り付け" className="ui-icon" />
                </button>
                <button type="button" className="ui-btn is-primary">
                  読込
                </button>
              </div>

              {/* グループ連動ルール設定バー（5刻み上限 150〜320） */}
              <div className="rule-toolbar">
                <label className="rule-field">
                  <span>対象グループ</span>
                  <select
                    className="ctrl-select"
                    value={editorGroupKey}
                    onChange={(e) => handleSelectEditorGroup(e.target.value)}
                  >
                    {GROUP_ITEMS.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>

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

              {/* コスト補正パネル：1) 印×レアリティ  2) 例外キャラ個別指定 */}
              <div className="cost-modifier-panel">
                <div className="modifier-form-row">
                  <span className="modifier-title">1) 印 × レアリティ コスト増減</span>
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
                      印補正追加
                    </button>
                  </div>
                </div>

                <div className="modifier-form-row">
                  <span className="modifier-title">2) 例外キャラ 個別コスト増減</span>
                  <div className="modifier-inputs">
                    <select
                      className="ctrl-select"
                      value={newExCharId}
                      onChange={(e) => setNewExCharId(Number(e.target.value))}
                      aria-label="例外キャラ"
                    >
                      {ALL_SAMPLE_CHARS_LIST.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.rarity} / {c.cost})
                        </option>
                      ))}
                    </select>

                    <select
                      className="ctrl-select"
                      value={newExDelta}
                      onChange={(e) => setNewExDelta(Number(e.target.value))}
                      aria-label="個別コスト増減"
                    >
                      {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d > 0 ? `+${d}` : d}
                        </option>
                      ))}
                    </select>

                    <button type="button" className="ctrl-btn is-accent" onClick={addCharException}>
                      個別指定追加
                    </button>
                  </div>
                </div>

                <div className="modifier-chips-row">
                  {modifiers.length === 0 && charExceptions.length === 0 && (
                    <span className="modifier-empty">コスト補正ルールなし（通常ルール）</span>
                  )}
                  {modifiers.map((mod) => (
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
                        onClick={() => setModifiers((prev) => prev.filter((m) => m.id !== mod.id))}
                        aria-label="この補正を削除"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {charExceptions.map((ex) => {
                    const ch = getSampleChar(ex.charId);
                    return (
                      <span
                        key={ex.id}
                        className={`modifier-chip is-exception ${ex.delta < 0 ? 'is-down' : 'is-up'}`}
                      >
                        <span>
                          個別: {ch ? ch.name : `#${ex.charId}`}{' '}
                          <strong className="num-tabular">
                            {ex.delta > 0 ? `+${ex.delta}` : ex.delta}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCharExceptions((prev) => prev.filter((item) => item.id !== ex.id))
                          }
                          aria-label="この個別指定を削除"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 統合ステータスサマリー（入れ子なし・計器スタイル・一貫縦線） */}
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
                  <strong className="val num-tabular">{editorStats.totalHp}</strong>
                </div>
                <div className="editor-stat-block">
                  <span className="lbl">TOTAL ATK</span>
                  <strong className="val num-tabular">{editorStats.totalAtk}</strong>
                </div>
                <div className={`editor-stat-block ${isSOver || isBOver ? 'is-error' : ''}`}>
                  <span className="lbl">RARITY</span>
                  <strong className="val num-tabular">
                    S:{editorStats.rarityCounts.S} A:{editorStats.rarityCounts.A} B:
                    {editorStats.rarityCounts.B} C:{editorStats.rarityCounts.C}
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
                  const costInfo = calcCharEffectiveCost(ch, modifiers, charExceptions);
                  return (
                    <div
                      key={`slot-${idx}-${ch.id}`}
                      className="editor-slot"
                      title={`${ch.name} / ${getSealLabel(ch.type)}印 / ${ch.rarity} / Cost ${costInfo.effective}`}
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
                          costInfo.delta < 0 ? 'is-down' : costInfo.delta > 0 ? 'is-up' : ''
                        }`}
                      >
                        {costInfo.effective}
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
