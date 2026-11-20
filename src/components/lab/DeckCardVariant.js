'use client';

import { useEffect, useRef, useState } from 'react';
import { GROUP_BY_KEY, calcDeckSummary, getSampleChar } from '@/data/sampleDecks';
import { assetPath, pieceImageUrl } from '@/lib/assetPath';
import SubPieceMatrix from './SubPieceMatrix';

export const CARD_PATTERNS = [
  {
    id: 'legacy',
    code: '0',
    label: '0: 現行OTELLIA（基準）',
    summary: '4マス status-cell＋固定コメント枠（比較基準）',
  },
  {
    id: 'game-band',
    code: '1',
    label: '1: ゲーム内進化・タイトル帯型',
    summary: 'グループグラデ帯タイトル＋グループ/COST[3桁]・HP/ATK[5桁]の2段＋全幅40文字コメント',
  },
  {
    id: 'side-action',
    code: '2',
    label: '2: 右アクション縦柱・高密度型',
    summary: '右端に編集・コピー・削除を縦分離し、本体幅を最大化した高密度レイアウト',
  },
  {
    id: 'datasheet',
    code: '3',
    label: '3: 均等縦ライン・データシート型',
    summary: 'COST(3桁タイト)｜HP(5桁)｜ATK(5桁) に一貫縦線を引いた無駄空白ゼロの研究表型',
  },
  {
    id: 'pillar-compact',
    code: '4',
    label: '4: 縦幅最小・コンパクト型',
    summary: '重複ラベルを排し、タイトル幅・40文字コメント・高密度数値を最小縦幅に凝縮',
  },
  {
    id: 'lab-ledger',
    code: '5',
    label: '5: 最上段フル幅カラー帯・台帳型',
    summary: 'カード最上段をフル幅のグループ帯にし、375pxでも長いデッキ名が途切れない台帳型',
  },
];

export default function DeckCardVariant({
  deck,
  pattern = 'game-band',
  groupApplyMode = 'title-band',
  leaderMarker = 'dot',
  cardMixer = {},
  baselineHeight = null,
  showMeasure = false,
  onHeightMeasured,
  onSelectForEditor,
}) {
  const cardRef = useRef(null);
  const [heightPx, setHeightPx] = useState(null);

  const visualLayout = cardMixer.visualLayout || 'stacked';
  const showMetaLine = cardMixer.showMetaLine !== false;

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const next = Math.round(el.getBoundingClientRect().height);
      setHeightPx((prev) => (prev === next ? prev : next));
      if (onHeightMeasured) onHeightMeasured(next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeightMeasured, pattern, groupApplyMode, visualLayout, showMetaLine]);

  const groupInfo = GROUP_BY_KEY[deck.groupKey] || GROUP_BY_KEY['1'];
  const leader = getSampleChar(deck.leaderId);
  const stats = calcDeckSummary(deck);
  const baseAttr = leader?.attr || 'god';
  const groupGradient = `var(--group-gradient-${deck.groupKey})`;
  const groupTint = `var(--group-tint-${deck.groupKey})`;
  const groupText = `var(--group-text-${deck.groupKey})`;

  const heightDiff =
    baselineHeight != null && heightPx != null ? heightPx - baselineHeight : null;

  const styleVars = {
    '--card-group-gradient': groupGradient,
    '--card-group-tint': groupTint,
    '--card-group-text': groupText,
  };

  const actionButtons = (vertical = false) => (
    <div className={`dc-actions ${vertical ? 'is-vertical' : ''}`}>
      <button
        type="button"
        className="dc-icon-btn"
        title="編集モックに読み込む"
        onClick={() => onSelectForEditor && onSelectForEditor(deck)}
      >
        <img src={assetPath('/images/icons/edit.svg')} alt="編集" className="ui-icon" />
      </button>
      <button type="button" className="dc-icon-btn" title="IDコピー（デモ）">
        <img src={assetPath('/images/icons/copy.svg')} alt="コピー" className="ui-icon" />
      </button>
      <button type="button" className="dc-icon-btn" title="削除（デモ）">
        <img src={assetPath('/images/icons/trash.svg')} alt="削除" className="ui-icon" />
      </button>
    </div>
  );

  const leaderThumb = (
    <div className="dc-leader-box" title={leader ? `L: ${leader.name}` : 'リーダー未設定'}>
      <img
        src={assetPath(`/images/bases/${baseAttr}.png`)}
        alt=""
        className="dc-leader-base"
      />
      <img
        src={pieceImageUrl(deck.leaderId)}
        alt={leader?.name || 'リーダー'}
        className="dc-leader-char"
      />
    </div>
  );

  const visualBlock = (
    <div className={`dc-visual-col layout-${visualLayout}`}>
      {leaderThumb}
      <SubPieceMatrix subs={deck.subs} leaderMarker={leaderMarker} variant="card" />
    </div>
  );

  const measureTag =
    showMeasure && heightPx != null ? (
      <div className="dc-measure-tag num-tabular" aria-label="カードの縦幅実測">
        <span>{heightPx}px</span>
        {heightDiff !== null && pattern !== 'legacy' && (
          <span className={heightDiff <= 0 ? 'is-smaller' : 'is-taller'}>
            {heightDiff > 0 ? `+${heightDiff}` : heightDiff}px
          </span>
        )}
      </div>
    ) : null;

  const metaLine = showMetaLine ? (
    <div className="dc-meta-line num-tabular">
      <span className="dc-meta-code">{deck.deckCode}</span>
      <span className="dc-meta-date">{deck.createdAt}</span>
    </div>
  ) : null;

  return (
    <article
      ref={cardRef}
      style={styleVars}
      className={`deck-card pattern-${pattern} group-mode-${groupApplyMode}`}
    >
      {measureTag}

      {/* 0: 現行OTELLIA基準 */}
      {pattern === 'legacy' && (
        <>
          <div className="dc-legacy-top">
            <div className="dc-visual-col layout-stacked">
              {leaderThumb}
              <SubPieceMatrix subs={deck.subs} leaderMarker={leaderMarker} variant="card" />
            </div>
            <div className="dc-legacy-info">
              <div className="dc-legacy-head">
                <div className="dc-title-wrap">
                  <img
                    src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                    alt=""
                    className="dc-type-icon"
                  />
                  <span className="dc-name">{deck.name}</span>
                </div>
              </div>
              <div className="dc-legacy-cells">
                <div className="dc-legacy-cell">
                  <span className="lbl">GROUP</span>
                  <span className="val">{groupInfo.short}</span>
                </div>
                <div className="dc-legacy-cell">
                  <span className="lbl">COST</span>
                  <span className="val num-tabular">{stats.baseCost}</span>
                </div>
                <div className="dc-legacy-cell">
                  <span className="lbl">HP</span>
                  <span className="val num-tabular">{stats.totalHp}</span>
                </div>
                <div className="dc-legacy-cell">
                  <span className="lbl">ATK</span>
                  <span className="val num-tabular">{stats.totalAtk}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="dc-legacy-bottom">
            <p className="dc-legacy-comment">{deck.comment}</p>
            {actionButtons(false)}
          </div>
        </>
      )}

      {/* 1: ゲーム内進化・タイトル帯型 */}
      {pattern === 'game-band' && (
        <>
          <div className="dc-top-grid">
            {visualBlock}
            <div className="dc-right-stack">
              <div className="dc-band-title">
                <img
                  src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                  alt=""
                  className="dc-type-icon"
                />
                <h4 className="dc-name">{deck.name}</h4>
              </div>
              <div className="dc-kv-row is-two-col">
                <div className="dc-kv">
                  <span className="dc-kv-lbl">GROUP</span>
                  <span className="dc-kv-text">{groupInfo.label}</span>
                </div>
                <div className="dc-kv is-cost-cell">
                  <span className="dc-kv-lbl">COST</span>
                  <strong className="dc-kv-val num-tabular">{stats.baseCost}</strong>
                </div>
              </div>
              <div className="dc-kv-row is-two-col">
                <div className="dc-kv">
                  <span className="dc-kv-lbl">HP</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalHp}</strong>
                </div>
                <div className="dc-kv">
                  <span className="dc-kv-lbl">ATK</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalAtk}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="dc-foot-row">
            <p className="dc-comment-full">{deck.comment}</p>
            {actionButtons(false)}
          </div>
          {metaLine}
        </>
      )}

      {/* 2: 右アクション縦柱・高密度型 */}
      {pattern === 'side-action' && (
        <div className="dc-side-shell">
          <div className="dc-side-body">
            <div className="dc-top-grid">
              {visualBlock}
              <div className="dc-right-stack">
                <div className="dc-band-title">
                  <img
                    src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                    alt=""
                    className="dc-type-icon"
                  />
                  <h4 className="dc-name">{deck.name}</h4>
                </div>
                <div className="dc-kv-row is-two-col">
                  <div className="dc-kv">
                    <span className="dc-kv-lbl">GROUP</span>
                    <span className="dc-kv-text">{groupInfo.short}</span>
                  </div>
                  <div className="dc-kv is-cost-cell">
                    <span className="dc-kv-lbl">COST</span>
                    <strong className="dc-kv-val num-tabular">{stats.baseCost}</strong>
                  </div>
                </div>
                <div className="dc-kv-row is-two-col">
                  <div className="dc-kv">
                    <span className="dc-kv-lbl">HP</span>
                    <strong className="dc-kv-val num-tabular">{stats.totalHp}</strong>
                  </div>
                  <div className="dc-kv">
                    <span className="dc-kv-lbl">ATK</span>
                    <strong className="dc-kv-val num-tabular">{stats.totalAtk}</strong>
                  </div>
                </div>
              </div>
            </div>
            <p className="dc-comment-full">{deck.comment}</p>
            {metaLine}
          </div>
          <div className="dc-side-rail">{actionButtons(true)}</div>
        </div>
      )}

      {/* 3: 均等縦ライン・データシート型 */}
      {pattern === 'datasheet' && (
        <>
          <div className="dc-top-grid">
            {visualBlock}
            <div className="dc-right-stack">
              <div className="dc-band-title">
                <img
                  src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                  alt=""
                  className="dc-type-icon"
                />
                <h4 className="dc-name">{deck.name}</h4>
              </div>
              <div className="dc-datasheet-sub">
                <span>{groupInfo.label}</span>
              </div>
              <div className="dc-tight-metrics">
                <div className="dc-tight-cell is-cost">
                  <span className="dc-kv-lbl">COST</span>
                  <strong className="dc-kv-val num-tabular">{stats.baseCost}</strong>
                </div>
                <div className="dc-tight-cell">
                  <span className="dc-kv-lbl">HP</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalHp}</strong>
                </div>
                <div className="dc-tight-cell">
                  <span className="dc-kv-lbl">ATK</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalAtk}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="dc-foot-row">
            <p className="dc-comment-full">{deck.comment}</p>
            {actionButtons(false)}
          </div>
          {metaLine}
        </>
      )}

      {/* 4: 縦幅最小・コンパクト型 */}
      {pattern === 'pillar-compact' && (
        <>
          <div className="dc-top-grid">
            {visualBlock}
            <div className="dc-right-stack">
              <div className="dc-band-title">
                <img
                  src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                  alt=""
                  className="dc-type-icon"
                />
                <h4 className="dc-name">{deck.name}</h4>
              </div>
              <div className="dc-compact-inline-stats">
                <span className="dc-compact-group">{groupInfo.short}</span>
                <span className="dc-inline-kv">
                  <small>COST</small>
                  <strong className="num-tabular">{stats.baseCost}</strong>
                </span>
                <span className="dc-inline-kv">
                  <small>HP</small>
                  <strong className="num-tabular">{stats.totalHp}</strong>
                </span>
                <span className="dc-inline-kv">
                  <small>ATK</small>
                  <strong className="num-tabular">{stats.totalAtk}</strong>
                </span>
              </div>
              <div className="dc-foot-row">
                <p className="dc-comment-full">{deck.comment}</p>
                {actionButtons(false)}
              </div>
            </div>
          </div>
          {metaLine}
        </>
      )}

      {/* 5: 最上段フル幅カラー帯・台帳型 */}
      {pattern === 'lab-ledger' && (
        <>
          <div className="dc-ledger-banner">
            <div className="dc-title-wrap">
              <img
                src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                alt=""
                className="dc-type-icon"
              />
              <h4 className="dc-name">{deck.name}</h4>
            </div>
            <span className="dc-ledger-group">{groupInfo.label}</span>
          </div>
          <div className="dc-top-grid">
            {visualBlock}
            <div className="dc-right-stack">
              <div className="dc-tight-metrics">
                <div className="dc-tight-cell is-cost">
                  <span className="dc-kv-lbl">COST</span>
                  <strong className="dc-kv-val num-tabular">{stats.baseCost}</strong>
                </div>
                <div className="dc-tight-cell">
                  <span className="dc-kv-lbl">HP</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalHp}</strong>
                </div>
                <div className="dc-tight-cell">
                  <span className="dc-kv-lbl">ATK</span>
                  <strong className="dc-kv-val num-tabular">{stats.totalAtk}</strong>
                </div>
              </div>
              <div className="dc-foot-row">
                <p className="dc-comment-full">{deck.comment}</p>
                {actionButtons(false)}
              </div>
            </div>
          </div>
          {metaLine}
        </>
      )}
    </article>
  );
}
