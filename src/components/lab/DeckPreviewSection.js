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
  buildGroupSpecsMarkdown,
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
const DELTA_OPTIONS = Array.from({ length: 36 }, (_, i) => i - 25).filter((n) => n !== 0); // -25..+10

const OVERLAY_MODES = [
  { id: 'cost', label: 'コスト' },
  { id: 'rarity', label: 'レアリティ' },
  { id: 'atk', label: 'ATK' },
  { id: 'hp', label: 'HP' },
  { id: 'plus', label: 'プラス値' },
];

const PLACEMENT_OPTIONS = [
  { id: 'top-tag-bottom-num', label: '上部帯＋右下Cost(ゲーム風)' },
  { id: 'bottom-right-badge', label: '右下 18(-2) 一体型' },
  { id: 'top-right-delta', label: '右上差分＋右下数値' },
  { id: 'bottom-bar', label: '下端フラット帯' },
];

const INITIAL_SEAL_MODIFIERS = [
  { id: 'mod-1', sealId: 2, rarityBucket: 'S', delta: -2 },
  { id: 'mod-2', sealId: 2, rarityBucket: 'A', delta: 1 },
];

const INITIAL_CHAR_EXCEPTIONS = [{ id: 'ex-1', charId: 8179, delta: -2 }];

const ALL_SAMPLE_CHARS_LIST = Object.values(SAMPLE_CHARACTERS);

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function DeckPreviewSection({
  version,
  themeMode,
  viewportWidth,
  onUpdateCostOverlayColor,
  onChangeCostOverlayPlacement,
}) {
  const groupNotes = useSyncExternalStore(
    subscribeGroupNotes,
    getGroupNotesSnapshot,
    getGroupNotesServerSnapshot
  );

  // 倉庫状態
  const [groupFilter, setGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [copiedSpecs, setCopiedSpecs] = useState(false);

  // 編集モック状態
  const [activeEditorDeckId, setActiveEditorDeckId] = useState(SAMPLE_DECKS[1].id);
  const [idInput, setIdInput] = useState(SAMPLE_DECKS[1].deckCode);
  const [editorGroupKey, setEditorGroupKey] = useState(SAMPLE_DECKS[1].groupKey);
  const [costLimit, setCostLimit] = useState(160);
  const [maxSCount, setMaxSCount] = useState(3);
  const [maxBCount, setMaxBCount] = useState(1);

  // 目ボタン切替テスト状態
  const [overlayMode, setOverlayMode] = useState('cost');
  const [eyeUiStyle, setEyeUiStyle] = useState('cycle'); // 'cycle' | 'tabs'
  const [autoSortByStat, setAutoSortByStat] = useState(true);

  // コスト増減設定
  const [costColorEditTheme, setCostColorEditTheme] = useState('light');
  const [showCostColorConfig, setShowCostColorConfig] = useState(true);
  const [modifiers, setModifiers] = useState(INITIAL_SEAL_MODIFIERS);
  const [charExceptions, setCharExceptions] = useState(INITIAL_CHAR_EXCEPTIONS);

  // 印補正追加フォーム
  const [newSealId, setNewSealId] = useState(6);
  const [newRarity, setNewRarity] = useState('S');
  const [newDelta, setNewDelta] = useState(-2);

  // 個別キャラ指定（方式A: 16枠タップ / 方式B: 全キャラ検索）
  const [exceptionInputTab, setExceptionInputTab] = useState('slot'); // 'slot' | 'search'
  const [selectedSlotCharId, setSelectedSlotCharId] = useState(8167);
  const [charSearchFilter, setCharSearchFilter] = useState('');
  const [newExCharId, setNewExCharId] = useState(8195);
  const [newExDelta, setNewExDelta] = useState(-20);

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

  // 目ボタンで ATK / HP を選んだときの連動ソート（リーダー0番固定＋サブ15体降順）
  const displaySubs = [...editorDeck.subs];
  if (autoSortByStat && (overlayMode === 'atk' || overlayMode === 'hp')) {
    displaySubs.sort((aId, bId) => {
      const a = getSampleChar(aId);
      const b = getSampleChar(bId);
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return overlayMode === 'atk' ? b.atk - a.atk : b.hp - a.hp;
    });
  }
  const all16Slots = [editorDeck.leaderId, ...displaySubs];

  const isCostOver = editorStats.adjustedCost > costLimit;
  const isSOver = maxSCount !== 99 && editorStats.rarityCounts.S > maxSCount;
  const isBOver = maxBCount !== 99 && editorStats.rarityCounts.B > maxBCount;

  const costPlacement = version.costOverlay?.placement || 'top-tag-bottom-num';
  const editingCostColors =
    version.costOverlay?.[costColorEditTheme] || version.costOverlay?.light || {};

  const cycleOverlayMode = () => {
    const idx = OVERLAY_MODES.findIndex((m) => m.id === overlayMode);
    const next = OVERLAY_MODES[(idx + 1) % OVERLAY_MODES.length];
    setOverlayMode(next.id);
  };

  const handleCopyGroupSpecs = async () => {
    const md = buildGroupSpecsMarkdown(groupNotes);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedSpecs(true);
      window.setTimeout(() => setCopiedSpecs(false), 1800);
    } catch {}
  };

  const loadDeckIntoEditor = (deck) => {
    setActiveEditorDeckId(deck.id);
    setIdInput(deck.deckCode);
    setEditorGroupKey(deck.groupKey);
    setSelectedSlotCharId(deck.leaderId);
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

  const setCharExceptionDelta = (charId, deltaVal) => {
    const numId = Number(charId);
    const numDelta = Number(deltaVal);
    setCharExceptions((prev) => {
      const filtered = prev.filter((ex) => Number(ex.charId) !== numId);
      if (numDelta === 0) return filtered;
      return [...filtered, { id: `ex-${numId}`, charId: numId, delta: numDelta }];
    });
  };

  const selectedCharObj = getSampleChar(selectedSlotCharId);
  const selectedCharDelta =
    charExceptions.find((ex) => Number(ex.charId) === Number(selectedSlotCharId))
      ?.delta || 0;

  const searchableChars = ALL_SAMPLE_CHARS_LIST.filter((c) =>
    !charSearchFilter.trim()
      ? true
      : c.name.toLowerCase().includes(charSearchFilter.trim().toLowerCase())
  );

  const currentOverlayLabel =
    OVERLAY_MODES.find((m) => m.id === overlayMode)?.label || 'コスト';

  return (
    <section className="lab-section" id="deck-preview">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">
            SECTION 05 // GROUP RULE MATRIX &amp; DECK WORKSPACE
          </span>
          <h2 className="lab-section-title">
            グループ仕様表・実戦倉庫・目ボタン切替 &amp; コスト補正ラボ
          </h2>
          <p className="lab-section-desc">
            外箱の入れ子（Cardocalypse）を排したフラットな面構成で、メモ付きグループ仕様表コピー、目ボタン5モード切替、コスト増減の色/配置調整、個別コスト入力2方式を比較できます。
          </p>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="real-deck-lab">
            {/* Part 0: デッキグループ仕様マップ（単一サーフェス＋仕切り線） */}
            <div className="flat-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <h3>デッキグループ別ルール仕様マップ（MAX 320 スケール）</h3>
                </div>
                <button
                  type="button"
                  className="ctrl-btn is-primary"
                  onClick={handleCopyGroupSpecs}
                >
                  {copiedSpecs ? 'コピーしました！' : '仕様表＋メモをコピー'}
                </button>
              </div>

              <div className="group-spec-table-wrap">
                <table className="group-spec-table">
                  <thead>
                    <tr>
                      <th>グループ</th>
                      <th>コスト上限グラフ（MAX 320）</th>
                      <th>印/キャラ増減</th>
                      <th>制限 / 仕様メモ（コピー対象・自動保存）</th>
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
            <div className="flat-panel">
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

            {/* Part B: デッキ編集モック（フラット仕切り構成） */}
            <div className="flat-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <img
                    src={assetPath('/images/icons/deckeditor.svg')}
                    alt=""
                    className="ui-icon"
                  />
                  <h3>デッキ編成・目👁️表示切替 &amp; コスト増減ラボ</h3>
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

              {/* 50桁ID読込バー */}
              <div className="editor-section-band">
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
              </div>

              {/* ルール設定バー（仕切り線構成） */}
              <div className="editor-section-band">
                <div className="rule-toolbar-flat">
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
              </div>

              {/* 統合ステータス行 + 目👁️ボタン切替UI（方式1 / 方式2 比較） */}
              <div className="editor-section-band">
                <div className="editor-header-combo">
                  <div className="editor-stats-flat">
                    <div className={`stat-inline ${isCostOver ? 'is-error' : ''}`}>
                      <span className="lbl">COST</span>
                      <strong className="val num-tabular">
                        {editorStats.adjustedCost}/{costLimit}
                      </strong>
                      {editorStats.adjustedCost !== editorStats.baseCost && (
                        <small className="num-tabular">(素{editorStats.baseCost})</small>
                      )}
                    </div>
                    <div className="stat-inline">
                      <span className="lbl">HP</span>
                      <strong className="val num-tabular">{editorStats.totalHp}</strong>
                    </div>
                    <div className="stat-inline">
                      <span className="lbl">ATK</span>
                      <strong className="val num-tabular">{editorStats.totalAtk}</strong>
                    </div>
                    <div className={`stat-inline ${isSOver || isBOver ? 'is-error' : ''}`}>
                      <span className="lbl">RARITY</span>
                      <strong className="val num-tabular">
                        S{editorStats.rarityCounts.S}/A{editorStats.rarityCounts.A}/B
                        {editorStats.rarityCounts.B}/C{editorStats.rarityCounts.C}
                      </strong>
                    </div>
                  </div>

                  <div className="eye-controls-wrap">
                    <div className="ctrl-segmented" title="表示切替UIの方式を比較">
                      <button
                        type="button"
                        className={eyeUiStyle === 'cycle' ? 'is-active' : ''}
                        onClick={() => setEyeUiStyle('cycle')}
                      >
                        方式1: 👁️順送り
                      </button>
                      <button
                        type="button"
                        className={eyeUiStyle === 'tabs' ? 'is-active' : ''}
                        onClick={() => setEyeUiStyle('tabs')}
                      >
                        方式2: 5項目タブ
                      </button>
                    </div>

                    {eyeUiStyle === 'cycle' ? (
                      <button
                        type="button"
                        className="eye-cycle-btn"
                        onClick={cycleOverlayMode}
                        title="クリックで レアリティ→ATK→HP→コスト→プラス値 を切替"
                      >
                        <EyeIcon />
                        <span>表示: {currentOverlayLabel}</span>
                      </button>
                    ) : (
                      <div className="ctrl-segmented">
                        {OVERLAY_MODES.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={overlayMode === m.id ? 'is-active' : ''}
                            onClick={() => setOverlayMode(m.id)}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={autoSortByStat}
                        onChange={(e) => setAutoSortByStat(e.target.checked)}
                      />
                      <span>ATK/HP時は自動降順</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 16枠デッキグリッド（5モードオーバーレイ＋コスト配置/色反映） */}
              <div className="editor-section-band">
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
                    const deltaState =
                      costInfo.delta < 0 ? 'down' : costInfo.delta > 0 ? 'up' : 'normal';
                    const isSelectedForEx = Number(selectedSlotCharId) === Number(ch.id);

                    return (
                      <button
                        key={`slot-${idx}-${ch.id}`}
                        type="button"
                        onClick={() => setSelectedSlotCharId(ch.id)}
                        className={`editor-slot is-clickable ${isSelectedForEx ? 'is-focused' : ''}`}
                        title={`${ch.name} / ${getSealLabel(ch.type)}印 / ${ch.rarity} / Cost ${costInfo.effective}（クリックで個別コスト調整）`}
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

                        {/* 左下：共通レアリティバッジ */}
                        <span className={`slot-rarity-chip rarity-${ch.rarity[0].toLowerCase()}`}>
                          {ch.rarity}
                        </span>

                        {/* モード別オーバーレイ */}
                        {overlayMode === 'rarity' && (
                          <span className="slot-stat-overlay num-tabular">Lv.{ch.maxLv}</span>
                        )}
                        {overlayMode === 'atk' && (
                          <span className="slot-stat-overlay num-tabular">
                            <small>ATK</small> {ch.atk}
                          </span>
                        )}
                        {overlayMode === 'hp' && (
                          <span className="slot-stat-overlay num-tabular">
                            <small>HP</small> {ch.hp}
                          </span>
                        )}
                        {overlayMode === 'plus' && (
                          <span className="slot-plus-overlay num-tabular">
                            <span>+{ch.hpPlus}</span>
                            <span>+{ch.atkPlus}</span>
                          </span>
                        )}
                        {overlayMode === 'cost' && (
                          <div className={`slot-cost-layer place-${costPlacement} state-${deltaState}`}>
                            {costPlacement === 'top-tag-bottom-num' && (
                              <>
                                {costInfo.delta !== 0 && (
                                  <span className="cost-top-tag">
                                    コスト{costInfo.delta < 0 ? '↓' : '↑'}
                                  </span>
                                )}
                                <span className="cost-bottom-num num-tabular">
                                  <small>Cost.</small>
                                  {costInfo.effective}
                                </span>
                              </>
                            )}
                            {costPlacement === 'bottom-right-badge' && (
                              <span className="cost-single-badge num-tabular">
                                {costInfo.effective}
                                {costInfo.delta !== 0 &&
                                  `(${costInfo.delta > 0 ? `+${costInfo.delta}` : costInfo.delta})`}
                              </span>
                            )}
                            {costPlacement === 'top-right-delta' && (
                              <>
                                {costInfo.delta !== 0 && (
                                  <span className="cost-delta-pill num-tabular">
                                    {costInfo.delta > 0 ? `+${costInfo.delta}` : costInfo.delta}
                                  </span>
                                )}
                                <span className="cost-bottom-num num-tabular">{costInfo.effective}</span>
                              </>
                            )}
                            {costPlacement === 'bottom-bar' && (
                              <span className="cost-full-bar num-tabular">
                                Cost.{costInfo.effective}
                                {costInfo.delta !== 0 &&
                                  ` (${costInfo.delta > 0 ? `+${costInfo.delta}` : costInfo.delta})`}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* コスト増減の色 & 配置カスタム調整 + ルール編集（仕切り線バンド） */}
              <div className="editor-section-band">
                <div className="cost-config-header">
                  <div className="cost-placement-row">
                    <span className="modifier-title">コスト増減の配置</span>
                    <div className="ctrl-segmented">
                      {PLACEMENT_OPTIONS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={costPlacement === p.id ? 'is-active' : ''}
                          onClick={() => onChangeCostOverlayPlacement(p.id)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ctrl-btn is-xs"
                    onClick={() => setShowCostColorConfig((v) => !v)}
                  >
                    {showCostColorConfig ? '色調整を閉じる' : 'コスト増減の色を調整'}
                  </button>
                </div>

                {showCostColorConfig && (
                  <div className="cost-color-customizer">
                    <div className="cost-color-head">
                      <span>コスト増減カラー設定</span>
                      <div className="ctrl-segmented">
                        <button
                          type="button"
                          className={costColorEditTheme === 'light' ? 'is-active' : ''}
                          onClick={() => setCostColorEditTheme('light')}
                        >
                          Light 編集
                        </button>
                        <button
                          type="button"
                          className={costColorEditTheme === 'dark' ? 'is-active' : ''}
                          onClick={() => setCostColorEditTheme('dark')}
                        >
                          Dark 編集
                        </button>
                      </div>
                    </div>
                    <div className="cost-color-grid">
                      {[
                        { prefix: 'down', title: 'コスト減 (↓)' },
                        { prefix: 'up', title: 'コスト増 (↑)' },
                        { prefix: 'normal', title: '通常コスト' },
                      ].map((group) => (
                        <div key={group.prefix} className="cost-color-col">
                          <strong>{group.title}</strong>
                          {[
                            { key: `${group.prefix}Bg`, lbl: '背景' },
                            { key: `${group.prefix}Text`, lbl: '文字' },
                            { key: `${group.prefix}Border`, lbl: '枠線' },
                          ].map((f) => (
                            <label key={f.key} className="cost-color-picker-row">
                              <span>{f.lbl}</span>
                              <input
                                type="color"
                                value={editingCostColors[f.key] || '#000000'}
                                onChange={(e) =>
                                  onUpdateCostOverlayColor(
                                    costColorEditTheme,
                                    f.key,
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="text"
                                value={editingCostColors[f.key] || '#000000'}
                                onChange={(e) =>
                                  onUpdateCostOverlayColor(
                                    costColorEditTheme,
                                    f.key,
                                    e.target.value
                                  )
                                }
                                spellCheck={false}
                              />
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 印×レアリティ ＆ 個別キャラコスト補正入力UX比較 */}
              <div className="editor-section-band">
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
                      {[-10, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d > 0 ? `+${d}` : d}
                        </option>
                      ))}
                    </select>

                    <button type="button" className="ui-btn is-primary" onClick={addModifier}>
                      印補正追加
                    </button>
                  </div>
                </div>

                {/* 個別キャラコスト増減: 方式A vs 方式B 比較 */}
                <div className="exception-ux-block">
                  <div className="modifier-form-row">
                    <span className="modifier-title">
                      2) 個別キャラ コスト増減（白の塔 -20 / カップ戦例外対応）
                    </span>
                    <div className="ctrl-segmented">
                      <button
                        type="button"
                        className={exceptionInputTab === 'slot' ? 'is-active' : ''}
                        onClick={() => setExceptionInputTab('slot')}
                      >
                        方式A: 16枠タップ指定
                      </button>
                      <button
                        type="button"
                        className={exceptionInputTab === 'search' ? 'is-active' : ''}
                        onClick={() => setExceptionInputTab('search')}
                      >
                        方式B: 全キャラ検索追加
                      </button>
                    </div>
                  </div>

                  {exceptionInputTab === 'slot' ? (
                    <div className="slot-direct-bar">
                      <div className="slot-direct-target">
                        <span>選択中の駒（上の16枠をクリックで切替）：</span>
                        <strong>
                          {selectedCharObj
                            ? `${selectedCharObj.name} (素コスト ${selectedCharObj.cost})`
                            : '未選択'}
                        </strong>
                      </div>
                      {selectedCharObj && (
                        <div className="slot-direct-actions">
                          {[-20, -10, -5, -2, -1, 0, 1, 2].map((d) => (
                            <button
                              key={d}
                              type="button"
                              className={`ctrl-btn is-xs ${
                                selectedCharDelta === d ? 'is-primary' : ''
                              }`}
                              onClick={() => setCharExceptionDelta(selectedCharObj.id, d)}
                            >
                              {d > 0 ? `+${d}` : d === 0 ? '通常(0)' : d}
                            </button>
                          ))}
                          <select
                            className="ctrl-select"
                            value={selectedCharDelta}
                            onChange={(e) =>
                              setCharExceptionDelta(selectedCharObj.id, e.target.value)
                            }
                            aria-label="選択中キャラのコスト増減値"
                          >
                            <option value={0}>0（通常）</option>
                            {DELTA_OPTIONS.map((d) => (
                              <option key={d} value={d}>
                                {d > 0 ? `+${d}` : d}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="modifier-inputs">
                      <input
                        type="search"
                        className="ui-input is-compact"
                        style={{ maxWidth: '180px' }}
                        value={charSearchFilter}
                        onChange={(e) => setCharSearchFilter(e.target.value)}
                        placeholder="キャラ名で絞り込み..."
                        aria-label="例外キャラ絞り込み"
                      />
                      <select
                        className="ctrl-select"
                        value={newExCharId}
                        onChange={(e) => setNewExCharId(Number(e.target.value))}
                        aria-label="例外キャラ選択"
                      >
                        {searchableChars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.rarity} / Cost {c.cost})
                          </option>
                        ))}
                      </select>

                      <select
                        className="ctrl-select"
                        value={newExDelta}
                        onChange={(e) => setNewExDelta(Number(e.target.value))}
                        aria-label="個別コスト増減"
                      >
                        {DELTA_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d > 0 ? `+${d}` : d}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="ui-btn is-secondary"
                        onClick={() => setCharExceptionDelta(newExCharId, newExDelta)}
                      >
                        個別指定追加
                      </button>
                    </div>
                  )}
                </div>

                {/* 適用中ルールチップ */}
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
                        onClick={() =>
                          setModifiers((prev) => prev.filter((m) => m.id !== mod.id))
                        }
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
                        className={`modifier-chip is-exception ${
                          ex.delta < 0 ? 'is-down' : 'is-up'
                        }`}
                      >
                        <span>
                          個別: {ch ? ch.name : `#${ex.charId}`}{' '}
                          <strong className="num-tabular">
                            {ex.delta > 0 ? `+${ex.delta}` : ex.delta}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCharExceptionDelta(ex.charId, 0)}
                          aria-label="この個別指定を削除"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
}
