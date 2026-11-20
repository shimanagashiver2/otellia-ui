export const GROUP_ITEMS = [
  { key: '0', label: 'お試しデッキ', short: 'お試し', defaultRule: 'コスト200固定' },
  { key: '1', label: '基本デッキ', short: '基本', defaultRule: 'コスト200固定' },
  { key: '2', label: 'カップ戦専用', short: 'カップ戦', defaultRule: '月別上限＋印/個別上下' },
  { key: '3', label: 'シーズン専用', short: 'シーズン', defaultRule: 'クラス依存（ダイヤ200等）' },
  { key: '4', label: 'UNKNOWN', short: 'UNKNOWN', defaultRule: '予備枠' },
  { key: '5', label: '白の塔専用', short: '白の塔', defaultRule: '階層別上限＋印上下' },
  { key: '6', label: '闘技場専用A', short: '闘技場A', defaultRule: '可変（最大320）' },
  { key: '7', label: '闘技場専用B', short: '闘技場B', defaultRule: '可変（最大320）' },
  { key: '8', label: '闘技場専用C', short: '闘技場C', defaultRule: '可変（最大320）' },
  { key: '9', label: 'ロイヤル専用', short: 'ロイヤル', defaultRule: 'コスト180固定' },
  { key: 'a', label: 'グローリー専用', short: 'グローリー', defaultRule: 'コスト180固定' },
];

export const GROUP_BY_KEY = Object.fromEntries(GROUP_ITEMS.map((item) => [item.key, item]));

export const GROUP_RULE_SPECS = [
  {
    key: '1',
    defaultLimit: 200,
    maxLimit: 200,
    limitType: '固定 (200)',
    costVariation: 'なし',
    deckRestriction: '通常編成（同名制限等のみ）',
    note: '本来はプレイヤーランク依存だが200固定前提で扱う。',
  },
  {
    key: '3',
    defaultLimit: 200,
    maxLimit: 200,
    limitType: 'クラス依存 (5刻み)',
    costVariation: 'なし',
    deckRestriction: 'シーズン帯制限・通常ルール',
    note: 'ダイヤモンド帯200 / プラチナ帯195 等、5刻み。',
  },
  {
    key: '2',
    defaultLimit: 180,
    maxLimit: 220,
    limitType: '月別変動 (180等)',
    costVariation: '印×レアリティ＋一部例外キャラ個別指定',
    deckRestriction: 'S枚数制限（2〜3等）・B枚数制限（1等）あり',
    note: '毎月コストルールや印・キャラ別コストが変動。',
  },
  {
    key: '9',
    defaultLimit: 180,
    maxLimit: 180,
    limitType: '固定 (180)',
    costVariation: 'なし',
    deckRestriction: 'ロイヤル専用ルール',
    note: 'コスト上限180固定。',
  },
  {
    key: 'a',
    defaultLimit: 180,
    maxLimit: 180,
    limitType: '固定 (180)',
    costVariation: 'なし',
    deckRestriction: 'グローリー専用ルール（禁止・制限あり）',
    note: 'コスト上限180固定。一部駒の使用制限等。',
  },
  {
    key: '5',
    defaultLimit: 200,
    maxLimit: 260,
    limitType: '階層別変動',
    costVariation: '印別コスト上下あり',
    deckRestriction: '階層ごとの指定条件',
    note: '攻略する階層によりコスト上限も印増減も変わる。',
  },
  {
    key: '6',
    defaultLimit: 200,
    maxLimit: 320,
    limitType: '可変 (最大320)',
    costVariation: '開催ルールにより有無',
    deckRestriction: '闘技場イベント別ルール',
    note: '珍しいがコスト上限320までありえる。',
  },
  {
    key: '7',
    defaultLimit: 200,
    maxLimit: 320,
    limitType: '可変 (最大320)',
    costVariation: '開催ルールにより有無',
    deckRestriction: '闘技場イベント別ルール',
    note: '珍しいがコスト上限320までありえる。',
  },
  {
    key: '8',
    defaultLimit: 200,
    maxLimit: 320,
    limitType: '可変 (最大320)',
    costVariation: '開催ルールにより有無',
    deckRestriction: '闘技場イベント別ルール',
    note: '珍しいがコスト上限320までありえる。',
  },
  {
    key: '0',
    defaultLimit: 200,
    maxLimit: 200,
    limitType: '固定 (200)',
    costVariation: 'なし',
    deckRestriction: 'お試し・仮組用',
    note: 'コスト200固定で自由に試作する枠。',
  },
  {
    key: '4',
    defaultLimit: 200,
    maxLimit: 320,
    limitType: '未定義',
    costVariation: '不明',
    deckRestriction: '予備コード値',
    note: 'ID上の予備スロット。',
  },
];

export const SEAL_NAME_MAP = {
  1: '強化',
  2: '闘士',
  3: '導師',
  4: '獣使',
  5: '東方',
  6: '天界',
  7: '魔界',
  8: '幻獣',
  9: '術士',
  10: '戦国',
  11: '御伽',
  12: '三国',
  13: '人道',
  14: '幽鬼',
  15: '修羅',
  16: '叡智',
  17: '英傑',
  18: '西方',
  19: '勇猛',
  20: '妖魔',
  21: '北方',
  22: '南方',
};

export function getSealLabel(typeId) {
  if (typeId == null) return '不明';
  return SEAL_NAME_MAP[Number(typeId)] || `印 #${typeId}`;
}

export const RARITY_BUCKETS = ['S', 'A', 'B', 'C'];

export function getRarityBucket(rarity) {
  if (!rarity) return 'C';
  if (rarity === 'S+' || rarity === 'S') return 'S';
  if (rarity === 'A+' || rarity === 'A') return 'A';
  if (rarity === 'B') return 'B';
  return 'C';
}

export const ATTR_LABELS = {
  god: '神',
  devil: '魔',
  dragon: '竜',
};

export const SAMPLE_CHARACTERS = {
  8167: { id: 8167, name: '[風紀委員]セルフィ', attr: 'god', rarity: 'S+', cost: 20, type: 2, hp: 2795, atk: 1262 },
  8179: { id: 8179, name: '[轟く雷霆]ゼウス', attr: 'god', rarity: 'S+', cost: 20, type: 6, hp: 2820, atk: 1297 },
  8196: { id: 8196, name: '[愛の保育士さん]ジニア', attr: 'god', rarity: 'S+', cost: 20, type: 6, hp: 2802, atk: 1325 },
  8174: { id: 8174, name: '[深海のパストール]オルカ', attr: 'god', rarity: 'A+', cost: 10, type: 22, hp: 1663, atk: 967 },
  8197: { id: 8197, name: '[凛々しきメイド]ラサス', attr: 'god', rarity: 'A+', cost: 10, type: 19, hp: 1661, atk: 1005 },
  8206: { id: 8206, name: '[世を駆ける風神]厳王', attr: 'god', rarity: 'A+', cost: 10, type: 12, hp: 1652, atk: 980 },
  8208: { id: 8208, name: '[満点天使]メルシィ', attr: 'god', rarity: 'A+', cost: 10, type: 17, hp: 1685, atk: 990 },
  239: { id: 239, name: 'エイル', attr: 'god', rarity: 'A+', cost: 10, type: 6, hp: 1580, atk: 920 },
  280: { id: 280, name: 'コロポックル', attr: 'god', rarity: 'A+', cost: 10, type: 11, hp: 1560, atk: 940 },
  303: { id: 303, name: '力天使・ヴァーチュズ', attr: 'god', rarity: 'A+', cost: 10, type: 6, hp: 1610, atk: 955 },
  422: { id: 422, name: 'タロス', attr: 'god', rarity: 'A+', cost: 10, type: 2, hp: 1710, atk: 910 },
  8112: { id: 8112, name: 'サマー・雨丸', attr: 'god', rarity: 'B', cost: 5, type: 6, hp: 840, atk: 640 },
  8203: { id: 8203, name: '占い師・ミニルルカ', attr: 'god', rarity: 'B', cost: 5, type: 21, hp: 800, atk: 630 },

  8195: { id: 8195, name: '[夜に咲く瞳]鈴音', attr: 'devil', rarity: 'S+', cost: 20, type: 20, hp: 2535, atk: 1457 },
  8209: { id: 8209, name: '[解体屋]ソゾン', attr: 'devil', rarity: 'S+', cost: 20, type: 10, hp: 2546, atk: 1256 },
  8210: { id: 8210, name: '[地獄でごくろー]ロカ・リゥニー', attr: 'devil', rarity: 'S+', cost: 20, type: 11, hp: 2495, atk: 1262 },
  8211: { id: 8211, name: '[半人半機の少年]アズレト', attr: 'devil', rarity: 'A+', cost: 10, type: 17, hp: 1662, atk: 1020 },
  8212: { id: 8212, name: '[イマドキな小鬼ちゃん]ナズナ', attr: 'devil', rarity: 'A+', cost: 10, type: 18, hp: 1655, atk: 1036 },
  8213: { id: 8213, name: '[毒胞子I.V.]カビィ', attr: 'devil', rarity: 'A+', cost: 10, type: 14, hp: 1652, atk: 1040 },
  8214: { id: 8214, name: '[魔獣群体]マリモンガー', attr: 'devil', rarity: 'A+', cost: 10, type: 11, hp: 1634, atk: 1002 },
  546: { id: 546, name: 'ヨモツシコメ', attr: 'devil', rarity: 'A+', cost: 10, type: 14, hp: 1550, atk: 1010 },
  647: { id: 647, name: 'ジェイル', attr: 'devil', rarity: 'A+', cost: 10, type: 7, hp: 1590, atk: 980 },
  8115: { id: 8115, name: 'サマー・メーア', attr: 'devil', rarity: 'B', cost: 5, type: 8, hp: 770, atk: 710 },
  8204: { id: 8204, name: 'お花屋さん・ミニルルカ', attr: 'devil', rarity: 'B', cost: 5, type: 22, hp: 720, atk: 710 },

  8183: { id: 8183, name: '[実戦派女優]エレノア', attr: 'dragon', rarity: 'S+', cost: 20, type: 5, hp: 2826, atk: 1250 },
  8189: { id: 8189, name: '[空飛ぶご令嬢]ミラクア', attr: 'dragon', rarity: 'S+', cost: 20, type: 16, hp: 2785, atk: 1250 },
  8199: { id: 8199, name: '[ダイナーの守護者？]アースィマ', attr: 'dragon', rarity: 'S+', cost: 20, type: 18, hp: 2795, atk: 1250 },
  8192: { id: 8192, name: '[スリルジャンキー]ナルイード', attr: 'dragon', rarity: 'A+', cost: 10, type: 11, hp: 1718, atk: 1025 },
  8193: { id: 8193, name: '[見習い忍者]翠丸', attr: 'dragon', rarity: 'A+', cost: 10, type: 13, hp: 1665, atk: 1025 },
  8200: { id: 8200, name: '[すこやか農場]ラーガッツェ', attr: 'dragon', rarity: 'A+', cost: 10, type: 22, hp: 1640, atk: 1025 },
  8207: { id: 8207, name: '[苦労人文官]ヒネク', attr: 'dragon', rarity: 'A+', cost: 10, type: 16, hp: 1641, atk: 1025 },
  450: { id: 450, name: '竜侍女・エルダ', attr: 'dragon', rarity: 'A+', cost: 10, type: 5, hp: 1520, atk: 1050 },
  793: { id: 793, name: 'マギラ', attr: 'dragon', rarity: 'A+', cost: 10, type: 8, hp: 1570, atk: 1030 },
  3092: { id: 3092, name: 'ぬいぐるみアムルガル', attr: 'dragon', rarity: 'C', cost: 5, type: 8, hp: 632, atk: 672 },
  5453: { id: 5453, name: '竜之進', attr: 'dragon', rarity: 'C', cost: 5, type: 6, hp: 510, atk: 510 },
};

export function getSampleChar(id) {
  if (!id || id <= 0) return null;
  return SAMPLE_CHARACTERS[id] || null;
}

export function calcCharEffectiveCost(ch, sealModifiers = [], charExceptions = []) {
  if (!ch) return { base: 0, effective: 0, delta: 0 };
  const bucket = getRarityBucket(ch.rarity);

  // 個別キャラ例外指定を優先・合算
  const sealDelta = sealModifiers.reduce((acc, mod) => {
    if (mod.sealId === ch.type && mod.rarityBucket === bucket) {
      return acc + Number(mod.delta || 0);
    }
    return acc;
  }, 0);

  const charDelta = charExceptions.reduce((acc, ex) => {
    if (Number(ex.charId) === Number(ch.id)) {
      return acc + Number(ex.delta || 0);
    }
    return acc;
  }, 0);

  const totalDelta = sealDelta + charDelta;
  return {
    base: ch.cost,
    effective: Math.max(0, ch.cost + totalDelta),
    delta: totalDelta,
  };
}

export function calcDeckSummary(deck, sealModifiers = [], charExceptions = []) {
  const allIds = [deck.leaderId, ...deck.subs];
  let totalHp = 0;
  let totalAtk = 0;
  let baseCost = 0;
  let adjustedCost = 0;
  let filledCount = 0;
  const rarityCounts = { S: 0, A: 0, B: 0, C: 0 };
  const attrCounts = { god: 0, devil: 0, dragon: 0 };

  for (const id of allIds) {
    const ch = getSampleChar(id);
    if (!ch) continue;
    filledCount += 1;
    totalHp += ch.hp;
    totalAtk += ch.atk;
    baseCost += ch.cost;
    const bucket = getRarityBucket(ch.rarity);
    rarityCounts[bucket] += 1;
    if (attrCounts[ch.attr] !== undefined) attrCounts[ch.attr] += 1;
    adjustedCost += calcCharEffectiveCost(ch, sealModifiers, charExceptions).effective;
  }

  return {
    totalHp,
    totalAtk,
    baseCost,
    adjustedCost,
    filledCount,
    rarityCounts,
    attrCounts,
  };
}

// 各デッキ: コメントは最大40文字をリアルに検証できるよう40文字相当を設定、deckCodeは実仕様の50桁
export const SAMPLE_DECKS = [
  {
    id: 'deck-season-god',
    deckCode: 'A3f9K2mQx8Lp4Z1nW7vB6hTc9Yd2Rs5Fj8Mk4Np1Qw7Xz3Lu9',
    name: '天界耐久ゼウス軸',
    groupKey: '3',
    deckType: 'god',
    comment: 'オーラ２枚と回復連打で耐久。先攻は辺置きでＨＰ維持し、終盤ゼウスコンボで詰め切る',
    createdAt: '2026-11-12 02:20',
    leaderId: 8179,
    subs: [
      8167, 8196, 8167,
      8174, 8197, 8206, 8208,
      239, 280, 303, 422,
      8174, 8197, 8208, 8112,
    ],
  },
  {
    id: 'deck-cup-mixed',
    deckCode: 'C2k7M9pRt4Xy6Q3wN1vE8bHj5Kd9Lm2Pz4Vx7Wc1Ys6Fg3Qn8',
    name: '混合：マナデッキ',
    groupKey: '2',
    deckType: 'mixed',
    comment: 'Ｓ闘士ー２・Ａ闘士＋１・ゼウス個別ー２想定のカップ戦用。Ｂ１枠で１８０ぴったりに調整',
    createdAt: '2026-11-18 19:45',
    leaderId: 8167,
    subs: [
      8195,
      8174, 8197, 8206, 8208,
      8211, 8212, 8213, 8214,
      8192, 8193, 8200, 8207,
      8115, 3092,
    ],
  },
  {
    id: 'deck-glory-devil',
    deckCode: 'Gaf4R8nTz2Wc5H9yL6mP3dJk7Bv1Xq4Nz8Ms2Ft5Yw9Cp6Rh1',
    name: '鈴音毒バフ魔単',
    groupKey: 'a',
    deckType: 'devil',
    comment: 'グローリー環境向けの魔統一。序盤から毒ダメージを重ねて中盤の特殊ダメで一気にリーサル',
    createdAt: '2026-11-15 01:07',
    leaderId: 8195,
    subs: [
      8209, 8210, 8209,
      8211, 8212, 8213, 8214,
      546, 647, 8211, 8212,
      8213, 8214, 546, 647,
    ],
  },
  {
    id: 'deck-royal-dragon',
    deckCode: 'R9d3W6vBn1Jk8S4qM5xT7pZc2Lf9Gh3Yn6Bw1Kr4Vm8Qs5Dx2',
    name: 'エレノア竜速攻180',
    groupKey: '9',
    deckType: 'dragon',
    comment: 'ロイヤル上限１８０対応。Ｂ枠で手駒回転率を上げつつ４〜５ターンでの速攻決着を狙う',
    createdAt: '2026-11-10 23:12',
    leaderId: 8183,
    subs: [
      8189, 8199,
      8192, 8193, 8200, 8207,
      450, 793, 8192, 8193,
      8200, 8207, 450, 8112, 8204,
    ],
  },
  {
    id: 'deck-basic-balance',
    deckCode: 'B1p5L8cVn3Qz7R2wK9mD4hXj6Ts1Yb8Fk5Gn3Wp7Cr2Mz9Lv4',
    name: '神魔竜ハイブリッド',
    groupKey: '1',
    deckType: 'mixed',
    comment: 'ああああああああああああああああああああああああああああああああああああああああ',
    createdAt: '2026-11-04 01:08',
    leaderId: 8189,
    subs: [
      8179, 8195, 8199,
      8174, 8197, 8208, 8211,
      8213, 8214, 8192, 8193,
      8200, 8207, 8203, 5453,
    ],
  },
  {
    id: 'deck-trial-wip',
    deckCode: 'T0z2X4mNb6Vw8C1kP3qL9rHj5Df7Gs2Yt4Bn8Mx1Kp6Qw3Zv5',
    name: '新規構築メモ（仮組）',
    groupKey: '0',
    deckType: 'other',
    comment: '空き枠４つあり。後半Ａ枠を闘士印にするか天界印にするかダメージ計算しながら検証中',
    createdAt: '2026-11-19 14:30',
    leaderId: 8210,
    subs: [
      8167, 8183,
      8174, 8206, 8211, 8212,
      8192, 8200, 450, 8115,
      3092, null, null, null, null,
    ],
  },
];
