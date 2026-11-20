'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
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
  groupSupportsCostVariation,
} from '@/data/sampleDecks';
import { DEFAULT_SLOT_OVERLAY } from '@/design-versions/defaults';
import {
  getGroupNotesServerSnapshot,
  getGroupNotesSnapshot,
  subscribeGroupNotes,
  updateGroupNote,
} from '@/design-versions/labStore';
import { assetPath, pieceImageUrl, rarityImageUrl } from '@/lib/assetPath';
import { toPickerHex } from '@/lib/colorUtils';
import { useDialogLightDismiss } from '@/lib/useDialogLightDismiss';
import DeckCardVariant from './DeckCardVariant';
import PreviewSplitWrapper from './PreviewSplitWrapper';
import {
  IconAtk,
  IconClose,
  IconCost,
  IconHp,
  IconPlusMode,
  IconRarity,
  IconSliders,
} from './UiIcons';

const COST_LIMIT_OPTIONS = Array.from({ length: 35 }, (_, i) => 150 + i * 5); // 150..320 (5刻み)
const DELTA_OPTIONS = Array.from({ length: 36 }, (_, i) => i - 25).filter((n) => n !== 0); // -25..+10

const OVERLAY_MODES = [
  { id: 'cost', label: 'コスト', short: 'コスト', Icon: IconCost },
  { id: 'rarity', label: 'レアリティ', short: 'レア', Icon: IconRarity },
  { id: 'atk', label: 'ATK', short: 'ATK', Icon: IconAtk },
  { id: 'hp', label: 'HP', short: 'HP', Icon: IconHp },
  { id: 'plus', label: 'プラス値', short: 'プラス', Icon: IconPlusMode },
];

const SWITCHER_DESIGNS = [
  { id: 'tabs', label: '案A: 5等分下線タブ' },
  { id: 'icon-bar', label: '案B: アイコン+文字バー' },
  { id: 'stat-linked', label: '案C: ステータス欄連動' },
];

const INITIAL_SEAL_MODIFIERS = [
  { id: 'mod-1', sealId: 2, rarityBucket: 'S', delta: -2 },
  { id: 'mod-2', sealId: 2, rarityBucket: 'A', delta: 1 },
];

const INITIAL_CHAR_EXCEPTIONS = [{ id: 'ex-1', charId: 8179, delta: -2 }];

const ALL_SAMPLE_CHARS_LIST = Object.values(SAMPLE_CHARACTERS);

export default function DeckPreviewSection({
  version,
  themeMode,
  viewportWidth,
  onUpdateCostOverlayColor,
  onUpdateSlotOverlay,
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
  const [slotClickNotice, setSlotClickNotice] = useState('');

  // 5項目切替・文字細調整状態
  const [overlayMode, setOverlayMode] = useState('cost');
  const [switcherDesign, setSwitcherDesign] = useState('tabs'); // 'tabs' | 'icon-bar' | 'stat-linked'
  const [autoSortByStat, setAutoSortByStat] = useState(true);
  const [showSlotTypoPanel, setShowSlotTypoPanel] = useState(true);

  // コスト増減設定
  const [costColorEditTheme, setCostColorEditTheme] = useState('light');
  const [showCostColorConfig, setShowCostColorConfig] = useState(false);
  const [modifiers, setModifiers] = useState(INITIAL_SEAL_MODIFIERS);
  const [charExceptions, setCharExceptions] = useState(INITIAL_CHAR_EXCEPTIONS);

  // 印補正追加フォーム
  const [newSealId, setNewSealId] = useState(6);
  const [newRarity, setNewRarity] = useState('S');
  const [newDelta, setNewDelta] = useState(-2);

  // 個別キャラ指定UX比較: 'inline' (ルール欄内2タブ) | 'dialog' (専用編集モーダル)
  const [ruleUiMode, setRuleUiMode] = useState('inline');
  const [exceptionSubTab, setExceptionSubTab] = useState('deck16'); // 'deck16' | 'search'
  const [selectedExCharId, setSelectedExCharId] = useState(8167);
  const [charSearchFilter, setCharSearchFilter] = useState('');
  const [newExCharId, setNewExCharId] = useState(8195);
  const [newExDelta, setNewExDelta] = useState(-20);

  const ruleDialogRef = useRef(null);
  useDialogLightDismiss(ruleDialogRef);

  const supportsCostVariation = groupSupportsCostVariation(editorGroupKey);
  const activeModifiers = supportsCostVariation ? modifiers : [];
  const activeExceptions = supportsCostVariation ? charExceptions : [];

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
  const editorStats = calcDeckSummary(editorDeck, activeModifiers, activeExceptions);

  // ATK / HP を選んだときの連動ソート（リーダー0番固定＋サブ15体降順）
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

  const editingCostColors =
    version.costOverlay?.[costColorEditTheme] || version.costOverlay?.light || {};
  const slotOverlay = { ...DEFAULT_SLOT_OVERLAY, ...(version.slotOverlay || {}) };

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
    setSelectedExCharId(deck.leaderId);
    setSlotClickNotice('');
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

  const selectedExCharObj = getSampleChar(selectedExCharId);
  const selectedExCharDelta =
    charExceptions.find((ex) => Number(ex.charId) === Number(selectedExCharId))
      ?.delta || 0;

  const uniqueDeckChars = Array.from(
    new Set(all16Slots.filter((id) => Boolean(getSampleChar(id))))
  )
    .map((id) => getSampleChar(id))
    .filter(Boolean);

  const searchableChars = ALL_SAMPLE_CHARS_LIST.filter((c) =>
    !charSearchFilter.trim()
      ? true
      : c.name.toLowerCase().includes(charSearchFilter.trim().toLowerCase())
  );

  const renderRuleEditorsBody = () => (
    <div className="cost-rule-editors-stack">
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

          <button type="button" className="ui-btn is-primary is-sm" onClick={addModifier}>
            印補正を追加
          </button>
        </div>
      </div>

      <div className="exception-ux-block">
        <div className="modifier-form-row">
          <span className="modifier-title">
            2) 個別キャラ コスト増減（白の塔 -20 / カップ戦例外対応）
          </span>
          <div className="ctrl-segmented">
            <button
              type="button"
              className={exceptionSubTab === 'deck16' ? 'is-active' : ''}
              onClick={() => setExceptionSubTab('deck16')}
            >
              編成中キャラから選択
            </button>
            <button
              type="button"
              className={exceptionSubTab === 'search' ? 'is-active' : ''}
              onClick={() => setExceptionSubTab('search')}
            >
              全キャラ検索から追加
            </button>
          </div>
        </div>

        {exceptionSubTab === 'deck16' ? (
          <div className="ex-mini-deck-panel">
            <div className="ex-mini-char-strip" role="listbox" aria-label="編成中の駒から対象を選択">
              {uniqueDeckChars.map((ch) => {
                const isSelected = Number(selectedExCharId) === Number(ch.id);
                const exItem = charExceptions.find(
                  (ex) => Number(ex.charId) === Number(ch.id)
                );
                return (
                  <button
                    key={ch.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`ex-mini-char-btn ${isSelected ? 'is-selected' : ''} ${
                      exItem ? (exItem.delta < 0 ? 'has-down' : 'has-up') : ''
                    }`}
                    onClick={() => setSelectedExCharId(ch.id)}
                    title={`${ch.name} (素Cost ${ch.cost})`}
                  >
                    <img src={pieceImageUrl(ch.id)} alt={ch.name} />
                    {exItem && (
                      <span className="ex-mini-delta num-tabular">
                        {exItem.delta > 0 ? `+${exItem.delta}` : exItem.delta}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedExCharObj && (
              <div className="slot-direct-bar">
                <div className="slot-direct-target">
                  <span>設定対象：</span>
                  <strong>
                    {selectedExCharObj.name}（素コスト {selectedExCharObj.cost}）
                  </strong>
                </div>
                <div className="slot-direct-actions">
                  {[-20, -10, -5, -2, -1, 0, 1, 2].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`ctrl-btn is-xs ${
                        selectedExCharDelta === d ? 'is-primary' : ''
                      }`}
                      onClick={() => setCharExceptionDelta(selectedExCharObj.id, d)}
                    >
                      {d > 0 ? `+${d}` : d === 0 ? '通常(0)' : d}
                    </button>
                  ))}
                  <select
                    className="ctrl-select"
                    value={selectedExCharDelta}
                    onChange={(e) =>
                      setCharExceptionDelta(selectedExCharObj.id, e.target.value)
                    }
                    aria-label="選択キャラのコスト増減値"
                  >
                    <option value={0}>0（通常）</option>
                    {DELTA_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d > 0 ? `+${d}` : d}
                      </option>
                    ))}
                  </select>
                </div>
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
              className="ui-btn is-secondary is-sm"
              onClick={() => setCharExceptionDelta(newExCharId, newExDelta)}
            >
              個別指定を追加
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="lab-section" id="deck-preview">
      <div className="lab-section-head">
        <div>
          <h2 className="lab-section-title">
            5. グループ別仕様表・実戦倉庫・デッキ編成プレビュー
          </h2>
          <p className="lab-section-desc">
            仕様表コピー、5項目オーバーレイ表示切替（順送り廃止・狭い幅は中央全幅均等）、公式レアリティ画像、黒フチ＋2行右揃え文字サイズ調整、グループ連動コスト増減を確認できます。
          </p>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="real-deck-lab">
            {/* Part 0: デッキグループ仕様マップ */}
            <div className="flat-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <h3>デッキグループ別ルール仕様マップ（MAX 320 スケール）</h3>
                </div>
                <button
                  type="button"
                  className="ui-btn is-primary is-sm"
                  onClick={handleCopyGroupSpecs}
                >
                  {copiedSpecs ? 'コピーしました' : '仕様表＋メモをコピー'}
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
                    className="ui-select is-compact"
                    style={{ width: 'auto', minWidth: '126px' }}
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

            {/* Part B: デッキ編成モック */}
            <div className="flat-panel">
              <div className="mock-panel-head">
                <div className="mock-title-group">
                  <img
                    src={assetPath('/images/icons/deckeditor.svg')}
                    alt=""
                    className="ui-icon"
                  />
                  <h3>デッキ編成・5項目切替 &amp; コストルール</h3>
                </div>
                <select
                  className="ui-select is-compact"
                  style={{ width: 'auto', minWidth: '170px' }}
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
                  <button type="button" className="ui-btn is-primary is-sm">
                    読込
                  </button>
                </div>
              </div>

              {/* グループ＆制限ルールバー */}
              <div className="editor-section-band">
                <div className="rule-toolbar-flat">
                  <label className="rule-field">
                    <span>対象グループ</span>
                    <select
                      className="ui-select is-compact"
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
                      className="ui-select is-compact"
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
                      className="ui-select is-compact"
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
                      className="ui-select is-compact"
                      value={maxBCount}
                      onChange={(e) => setMaxBCount(Number(e.target.value))}
                    >
                      <option value={99}>制限なし</option>
                      <option value={1}>1枚まで</option>
                      <option value={2}>2枚まで</option>
                      <option value={3}>3枚まで</option>
                    </select>
                  </label>

                  {!supportsCostVariation && (
                    <span className="rule-no-var-note">
                      このグループはコスト増減なし（カップ戦・白の塔・闘技場選択時に増減設定を表示）
                    </span>
                  )}
                </div>
              </div>

              {/* 統合ステータス行 ＋ 5項目切替3案比較 */}
              <div className="editor-section-band">
                <div className="editor-header-combo">
                  <div className="switch-design-toolbar">
                    <span className="modifier-title">5項目切替UI比較</span>
                    <div className="ctrl-segmented">
                      {SWITCHER_DESIGNS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className={switcherDesign === d.id ? 'is-active' : ''}
                          onClick={() => setSwitcherDesign(d.id)}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <label className="comp-check is-compact">
                      <input
                        type="checkbox"
                        checked={autoSortByStat}
                        onChange={(e) => setAutoSortByStat(e.target.checked)}
                      />
                      <span>ATK/HP時は自動降順</span>
                    </label>
                  </div>

                  {/* 案C: ステータス行自体をクリック連動にする場合と通常表示 */}
                  {switcherDesign === 'stat-linked' ? (
                    <div className="stat-linked-bar">
                      <button
                        type="button"
                        className={`stat-linked-btn ${overlayMode === 'cost' ? 'is-active' : ''} ${
                          isCostOver ? 'is-error' : ''
                        }`}
                        onClick={() => setOverlayMode('cost')}
                      >
                        <span className="lbl">COST</span>
                        <strong className="val num-tabular">
                          {editorStats.adjustedCost}/{costLimit}
                        </strong>
                      </button>
                      <button
                        type="button"
                        className={`stat-linked-btn ${overlayMode === 'hp' ? 'is-active' : ''}`}
                        onClick={() => setOverlayMode('hp')}
                      >
                        <span className="lbl">HP</span>
                        <strong className="val num-tabular">{editorStats.totalHp}</strong>
                      </button>
                      <button
                        type="button"
                        className={`stat-linked-btn ${overlayMode === 'atk' ? 'is-active' : ''}`}
                        onClick={() => setOverlayMode('atk')}
                      >
                        <span className="lbl">ATK</span>
                        <strong className="val num-tabular">{editorStats.totalAtk}</strong>
                      </button>
                      <button
                        type="button"
                        className={`stat-linked-btn ${overlayMode === 'rarity' ? 'is-active' : ''} ${
                          isSOver || isBOver ? 'is-error' : ''
                        }`}
                        onClick={() => setOverlayMode('rarity')}
                      >
                        <span className="lbl">レア</span>
                        <strong className="val num-tabular">
                          S{editorStats.rarityCounts.S}/A{editorStats.rarityCounts.A}/B
                          {editorStats.rarityCounts.B}/C{editorStats.rarityCounts.C}
                        </strong>
                      </button>
                      <button
                        type="button"
                        className={`stat-linked-btn is-plus ${overlayMode === 'plus' ? 'is-active' : ''}`}
                        onClick={() => setOverlayMode('plus')}
                      >
                        <span className="lbl">PLUS</span>
                        <strong className="val num-tabular">表示</strong>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="editor-stats-flat">
                        <div className={`stat-inline ${isCostOver ? 'is-error' : ''}`}>
                          <span className="lbl">COST</span>
                          <strong className="val num-tabular">
                            {editorStats.adjustedCost}/{costLimit}
                          </strong>
                          {supportsCostVariation &&
                            editorStats.adjustedCost !== editorStats.baseCost && (
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

                      {switcherDesign === 'tabs' && (
                        <div
                          className="overlay-five-tabs is-underline"
                          role="tablist"
                          aria-label="16枠表示項目切替"
                        >
                          {OVERLAY_MODES.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              role="tab"
                              aria-selected={overlayMode === m.id}
                              className={`overlay-five-tab ${
                                overlayMode === m.id ? 'is-active' : ''
                              }`}
                              onClick={() => setOverlayMode(m.id)}
                            >
                              <span className="tab-full-lbl">{m.label}</span>
                              <span className="tab-short-lbl">{m.short}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {switcherDesign === 'icon-bar' && (
                        <div
                          className="overlay-five-tabs is-icon-bar"
                          role="tablist"
                          aria-label="16枠表示項目切替"
                        >
                          {OVERLAY_MODES.map(({ id, label, short, Icon }) => (
                            <button
                              key={id}
                              type="button"
                              role="tab"
                              aria-selected={overlayMode === id}
                              className={`overlay-icon-tab ${overlayMode === id ? 'is-active' : ''}`}
                              onClick={() => setOverlayMode(id)}
                            >
                              <Icon size={15} />
                              <span className="tab-full-lbl">{label}</span>
                              <span className="tab-short-lbl">{short}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 16枠デッキグリッド */}
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
                    const costInfo = calcCharEffectiveCost(
                      ch,
                      activeModifiers,
                      activeExceptions
                    );
                    const deltaState =
                      costInfo.delta < 0 ? 'down' : costInfo.delta > 0 ? 'up' : 'normal';

                    return (
                      <button
                        key={`slot-${idx}-${ch.id}`}
                        type="button"
                        onClick={() =>
                          setSlotClickNotice(
                            `枠${idx + 1}: ${ch.name} — 編成中はここをタップすると駒の選択・入れ替え画面が開きます`
                          )
                        }
                        className="editor-slot is-clickable"
                        title={`${ch.name} / ${getSealLabel(ch.type)}印 / ${ch.rarity} / Cost ${costInfo.effective}（タップで駒入れ替え想定）`}
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

                        {/* 左下：公式レアリティPNG */}
                        <img
                          src={rarityImageUrl(ch.rarity)}
                          alt={ch.rarity}
                          className="slot-rarity-img"
                        />

                        {/* 右下（背景なし・枠線なし・黒フチ＋黒シャドウ・右揃え複数行） */}
                        {overlayMode === 'rarity' && (
                          <div className="slot-hud-text" aria-label={`レベル ${ch.maxLv}`}>
                            <span className="slot-hud-lbl">Lv.</span>
                            <span className="slot-hud-val num-tabular">Max</span>
                          </div>
                        )}

                        {overlayMode === 'atk' && (
                          <div className="slot-hud-text">
                            <span className="slot-hud-lbl">ATK</span>
                            <span className="slot-hud-val num-tabular">{ch.atk}</span>
                          </div>
                        )}

                        {overlayMode === 'hp' && (
                          <div className="slot-hud-text">
                            <span className="slot-hud-lbl">HP</span>
                            <span className="slot-hud-val num-tabular">{ch.hp}</span>
                          </div>
                        )}

                        {overlayMode === 'plus' && (
                          <div className="slot-hud-text is-plus">
                            <span className="slot-hud-lbl">Plus</span>
                            <span className="slot-hud-plus num-tabular">+{ch.hpPlus}</span>
                            <span className="slot-hud-plus num-tabular">+{ch.atkPlus}</span>
                          </div>
                        )}

                        {overlayMode === 'cost' && (
                          <div className={`slot-cost-layer state-${deltaState}`}>
                            {supportsCostVariation && costInfo.delta !== 0 && (
                              <span className="cost-top-tag">
                                コスト{costInfo.delta < 0 ? '↓' : '↑'}
                              </span>
                            )}
                            <div className="slot-hud-text">
                              <span className="slot-hud-lbl">Cost.</span>
                              <span className="slot-hud-val num-tabular">
                                {costInfo.effective}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {slotClickNotice && (
                  <div className="slot-tap-feedback">
                    <span>{slotClickNotice}</span>
                    <button
                      type="button"
                      className="ctrl-btn is-xs"
                      onClick={() => setSlotClickNotice('')}
                      aria-label="案内を閉じる"
                    >
                      <IconClose size={12} />
                    </button>
                  </div>
                )}

                {/* 16枠文字サイズ・黒フチ細調整パネル */}
                <div className="slot-typo-box">
                  <div className="slot-typo-head">
                    <span className="slot-typo-title">
                      <IconSliders size={14} />
                      <span>16枠オーバーレイ文字サイズ・黒フチ細調整</span>
                    </span>
                    <div className="slot-typo-actions">
                      <button
                        type="button"
                        className="ctrl-btn is-xs"
                        onClick={() => {
                          Object.entries(DEFAULT_SLOT_OVERLAY).forEach(([k, v]) =>
                            onUpdateSlotOverlay(k, v)
                          );
                        }}
                      >
                        初期値へ
                      </button>
                      <button
                        type="button"
                        className="ctrl-btn is-xs"
                        onClick={() => setShowSlotTypoPanel((v) => !v)}
                      >
                        {showSlotTypoPanel ? '閉じる' : '調整を開く'}
                      </button>
                    </div>
                  </div>

                  {showSlotTypoPanel && (
                    <div className="slot-typo-sliders">
                      <label className="slider-row is-dense">
                        <span>上行ラベル</span>
                        <input
                          type="range"
                          min="6"
                          max="16"
                          step="0.5"
                          value={slotOverlay.labelSize}
                          onChange={(e) =>
                            onUpdateSlotOverlay('labelSize', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.labelSize}px</output>
                      </label>
                      <label className="slider-row is-dense">
                        <span>下行数値</span>
                        <input
                          type="range"
                          min="9"
                          max="26"
                          step="0.5"
                          value={slotOverlay.valueSize}
                          onChange={(e) =>
                            onUpdateSlotOverlay('valueSize', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.valueSize}px</output>
                      </label>
                      <label className="slider-row is-dense">
                        <span>Plus値</span>
                        <input
                          type="range"
                          min="8"
                          max="20"
                          step="0.5"
                          value={slotOverlay.plusValueSize}
                          onChange={(e) =>
                            onUpdateSlotOverlay('plusValueSize', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.plusValueSize}px</output>
                      </label>
                      <label className="slider-row is-dense">
                        <span>上部コスト帯</span>
                        <input
                          type="range"
                          min="7"
                          max="15"
                          step="0.5"
                          value={slotOverlay.tagSize}
                          onChange={(e) =>
                            onUpdateSlotOverlay('tagSize', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.tagSize}px</output>
                      </label>
                      <label className="slider-row is-dense">
                        <span>黒フチ太さ</span>
                        <input
                          type="range"
                          min="1"
                          max="4.5"
                          step="0.5"
                          value={slotOverlay.strokeWidth}
                          onChange={(e) =>
                            onUpdateSlotOverlay('strokeWidth', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.strokeWidth}px</output>
                      </label>
                      <label className="slider-row is-dense">
                        <span>行間微調整</span>
                        <input
                          type="range"
                          min="-2"
                          max="4"
                          step="0.5"
                          value={slotOverlay.lineGap}
                          onChange={(e) =>
                            onUpdateSlotOverlay('lineGap', Number(e.target.value))
                          }
                        />
                        <output className="num-tabular">{slotOverlay.lineGap}px</output>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* コスト増減設定エリア：カップ戦・白の塔・闘技場等のときのみ表示 */}
              {supportsCostVariation && (
                <>
                  <div className="editor-section-band">
                    <div className="cost-config-header">
                      <span className="modifier-title">
                        上部「コスト↓ / ↑」帯の配色（減少＝黄・増加＝青 暫定反映済み）
                      </span>
                      <button
                        type="button"
                        className="ctrl-btn is-xs"
                        onClick={() => setShowCostColorConfig((v) => !v)}
                      >
                        {showCostColorConfig ? '配色調整を閉じる' : '上部帯の色を調整'}
                      </button>
                    </div>

                    {showCostColorConfig && (
                      <div className="cost-color-customizer">
                        <div className="cost-color-head">
                          <span>上部帯カラー詳細編集</span>
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
                            { prefix: 'down', title: 'コスト減 (コスト↓)' },
                            { prefix: 'up', title: 'コスト増 (コスト↑)' },
                          ].map((group) => (
                            <div key={group.prefix} className="cost-color-col">
                              <strong>{group.title}</strong>
                              {[
                                { key: `${group.prefix}Bg`, lbl: '背景' },
                                { key: `${group.prefix}Text`, lbl: '文字' },
                                { key: `${group.prefix}Border`, lbl: '枠線', allowNone: true },
                              ].map((f) => {
                                const rawVal = editingCostColors[f.key] || '#000000';
                                return (
                                  <div key={f.key} className="cost-color-picker-row">
                                    <span>{f.lbl}</span>
                                    <input
                                      type="color"
                                      value={toPickerHex(rawVal)}
                                      onChange={(e) =>
                                        onUpdateCostOverlayColor(
                                          costColorEditTheme,
                                          f.key,
                                          e.target.value
                                        )
                                      }
                                      aria-label={`${group.title} ${f.lbl}色`}
                                    />
                                    <input
                                      type="text"
                                      value={rawVal}
                                      onChange={(e) =>
                                        onUpdateCostOverlayColor(
                                          costColorEditTheme,
                                          f.key,
                                          e.target.value
                                        )
                                      }
                                      spellCheck={false}
                                      aria-label={`${group.title} ${f.lbl}HEX`}
                                    />
                                    {f.allowNone && (
                                      <button
                                        type="button"
                                        className="ctrl-btn is-xs"
                                        onClick={() =>
                                          onUpdateCostOverlayColor(
                                            costColorEditTheme,
                                            f.key,
                                            '#00000000'
                                          )
                                        }
                                        title="枠線なし（透明）にする"
                                      >
                                        透明
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 印×レアリティ＆個別指定（16枠タップと衝突しないUX比較） */}
                  <div className="editor-section-band">
                    <div className="modifier-form-row">
                      <span className="modifier-title">コスト補正ルールの編集UI比較</span>
                      <div className="ctrl-segmented">
                        <button
                          type="button"
                          className={ruleUiMode === 'inline' ? 'is-active' : ''}
                          onClick={() => setRuleUiMode('inline')}
                        >
                          方式1: 画面内ミニ選択＋検索
                        </button>
                        <button
                          type="button"
                          className={ruleUiMode === 'dialog' ? 'is-active' : ''}
                          onClick={() => setRuleUiMode('dialog')}
                        >
                          方式2: 専用モーダルで編集
                        </button>
                      </div>
                    </div>

                    {ruleUiMode === 'inline' ? (
                      renderRuleEditorsBody()
                    ) : (
                      <div className="rule-modal-trigger-row">
                        <span className="rule-modal-desc">
                          編成画面を広く保ち、16枠タップ（駒入れ替え）との誤爆を防ぐ専用ダイアログ方式
                        </span>
                        <button
                          type="button"
                          className="ui-btn is-secondary is-sm"
                          onClick={() => ruleDialogRef.current?.showModal()}
                        >
                          コスト補正ルールを編集…
                        </button>
                      </div>
                    )}

                    {/* 適用中ルールチップ（減少=黄 / 増加=青） */}
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
                            <IconClose size={11} />
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
                              <IconClose size={11} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      />

      <dialog
        ref={ruleDialogRef}
        className="lab-dialog"
        closedby="any"
        aria-labelledby="cost-rule-dialog-title"
      >
        <div className="dialog-header">
          <div>
            <h3 id="cost-rule-dialog-title">コスト補正ルール設定（印・個別キャラ例外）</h3>
          </div>
          <form method="dialog">
            <button type="submit" value="close" className="ctrl-btn is-icon-only" aria-label="閉じる">
              <IconClose size={14} />
            </button>
          </form>
        </div>
        <div className="dialog-body">{renderRuleEditorsBody()}</div>
        <div className="dialog-footer">
          <form method="dialog">
            <button type="submit" value="close" className="ui-btn is-primary" autoFocus>
              完了
            </button>
          </form>
        </div>
      </dialog>
    </section>
  );
}
