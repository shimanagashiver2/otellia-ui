'use client';

import { getRarityBucket, getSampleChar, getSealLabel, ATTR_LABELS } from '@/data/sampleDecks';

export default function SubPieceMatrix({
  subs = [],
  leaderMarker = 'blank',
  compact = false,
}) {
  // 4x4 = 16セル。左上(0番)はブロックなし、1..15がサブ15体
  const cells = [null, ...Array.from({ length: 15 }, (_, idx) => subs[idx] ?? null)];

  return (
    <div
      className={`sub-matrix ${compact ? 'is-compact' : ''}`}
      role="img"
      aria-label="サブ駒15体マトリクス（左上はリーダー分の空き枠）"
    >
      {cells.map((charId, cellIndex) => {
        if (cellIndex === 0) {
          return (
            <span
              key="leader-hole"
              className={`matrix-cell is-leader-hole marker-${leaderMarker}`}
              title="リーダー枠（ブロック非配置）"
            >
              {leaderMarker === 'L' ? 'L' : leaderMarker === 'dot' ? '•' : ''}
            </span>
          );
        }

        const ch = getSampleChar(charId);
        if (!ch) {
          return (
            <span
              key={`empty-${cellIndex}`}
              className="matrix-cell is-empty"
              title={`サブ${cellIndex}: 空き枠`}
            />
          );
        }

        const bucket = getRarityBucket(ch.rarity);
        const tooltip = `${ch.name} (${ATTR_LABELS[ch.attr]} / ${ch.rarity} / Cost ${ch.cost} / ${getSealLabel(ch.type)})`;

        return (
          <span
            key={`cell-${cellIndex}-${ch.id}`}
            className={`matrix-cell attr-${ch.attr} rarity-${bucket.toLowerCase()}`}
            title={tooltip}
          />
        );
      })}
    </div>
  );
}
