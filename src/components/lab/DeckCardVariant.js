'use client';

import { useEffect, useRef, useState } from 'react';
import { GROUP_BY_KEY, calcDeckSummary, getSampleChar } from '@/data/sampleDecks';
import { assetPath, pieceImageUrl } from '@/lib/assetPath';
import SubPieceMatrix from './SubPieceMatrix';

export const CARD_PATTERNS = [
  {
    id: 'legacy',
    code: '0',
    label: '現行（入れ子カード）',
    summary: 'status-cell 4マス＋3行固定コメント枠の現行構造（比較基準）',
  },
  {
    id: 'hairline',
    code: 'A',
    label: 'A: 極細ヘアライン分割',
    summary: '入れ子背景を撤廃し、1px横/縦線＋大きめ等幅数値で整理',
  },
  {
    id: 'typographic',
    code: 'B',
    label: 'B: 余白＆タイポ階層のみ',
    summary: '内枠なし・余白リズムと太字数字の強弱だけで読ませる',
  },
  {
    id: 'instrument',
    code: 'C',
    label: 'C: 研究計器・スペック帯',
    summary: '水平メトリクス帯＋ラボ風ラベルで数値が最も大きく見える構成',
  },
  {
    id: 'ribbon',
    code: 'D',
    label: 'D: 左グラデ帯＋2段凝縮',
    summary: '左端のグループグラデ帯で視線誘導し、縦幅を最小化した高密度型',
  },
  {
    id: 'tonal',
    code: 'E',
    label: 'E: フラット面トーン差',
    summary: '線ではなく Surface 1/2 の極小な明度差だけで領域を分ける穏やか型',
  },
];

export default function DeckCardVariant({
  deck,
  pattern = 'instrument',
  groupApplyMode = 'left-bar',
  leaderMarker = 'blank',
  baselineHeight = null,
  showMeasure = false,
  onHeightMeasured,
  onSelectForEditor,
}) {
  const cardRef = useRef(null);
  const [heightPx, setHeightPx] = useState(null);

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
  }, [onHeightMeasured, pattern, groupApplyMode]);

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

  const actionButtons = (
    <div className="dc-actions">
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

  return (
    <article
      ref={cardRef}
      style={styleVars}
      className={`deck-card pattern-${pattern} group-mode-${groupApplyMode}`}
    >
      {showMeasure && heightPx != null && (
        <div className="dc-measure-tag num-tabular" aria-label="カードの縦幅実測">
          <span>{heightPx}px</span>
          {heightDiff !== null && pattern !== 'legacy' && (
            <span className={heightDiff <= 0 ? 'is-smaller' : 'is-taller'}>
              {heightDiff > 0 ? `+${heightDiff}` : heightDiff}px
            </span>
          )}
        </div>
      )}

      {pattern === 'legacy' ? (
        <>
          <div className="dc-legacy-top">
            <div className="dc-visual-col">
              {leaderThumb}
              <SubPieceMatrix subs={deck.subs} leaderMarker={leaderMarker} compact />
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
                <span className="dc-group-pill">{groupInfo.label}</span>
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
                  <span className="val num-tabular">{stats.totalHp.toLocaleString()}</span>
                </div>
                <div className="dc-legacy-cell">
                  <span className="lbl">ATK</span>
                  <span className="val num-tabular">{stats.totalAtk.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="dc-legacy-bottom">
            <p className="dc-legacy-comment">{deck.comment}</p>
            {actionButtons}
          </div>
        </>
      ) : (
        <>
          <div className="dc-main-row">
            <div className="dc-visual-col">
              {leaderThumb}
              <SubPieceMatrix subs={deck.subs} leaderMarker={leaderMarker} />
            </div>

            <div className="dc-body-col">
              <div className="dc-head-row">
                <div className="dc-title-wrap">
                  <img
                    src={assetPath(`/images/deck-types/${deck.deckType}.png`)}
                    alt=""
                    className="dc-type-icon"
                  />
                  <h4 className="dc-name">{deck.name}</h4>
                </div>
                <span className="dc-group-pill">{groupInfo.label}</span>
              </div>

              <div className="dc-metrics-row">
                <div className="dc-metric">
                  <span className="dc-metric-label">COST</span>
                  <strong className="dc-metric-val num-tabular">{stats.baseCost}</strong>
                </div>
                <div className="dc-metric">
                  <span className="dc-metric-label">HP</span>
                  <strong className="dc-metric-val num-tabular">
                    {stats.totalHp.toLocaleString()}
                  </strong>
                </div>
                <div className="dc-metric">
                  <span className="dc-metric-label">ATK</span>
                  <strong className="dc-metric-val num-tabular">
                    {stats.totalAtk.toLocaleString()}
                  </strong>
                </div>
                <div className="dc-metric is-count">
                  <span className="dc-metric-label">SLOTS</span>
                  <strong className="dc-metric-val num-tabular">{stats.filledCount}/16</strong>
                </div>
              </div>

              <div className="dc-foot-row">
                <p className="dc-comment" title={deck.comment}>
                  {deck.comment}
                </p>
                {actionButtons}
              </div>
            </div>
          </div>
          <div className="dc-meta-line num-tabular">
            <span>{deck.deckCode}</span>
            <span>{deck.createdAt}</span>
          </div>
        </>
      )}
    </article>
  );
}
