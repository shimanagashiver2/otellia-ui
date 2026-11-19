export const GROUP_ITEMS = [
  { key: '0', label: 'お試しデッキ', short: 'お試し', defaultRule: '自由編集' },
  { key: '1', label: '基本デッキ', short: '基本', defaultRule: 'コスト200' },
  { key: '2', label: 'カップ戦専用', short: 'カップ戦', defaultRule: '特殊コスト' },
  { key: '3', label: 'シーズン専用', short: 'シーズン', defaultRule: 'コスト200' },
  { key: '4', label: 'UNKNOWN', short: 'UNKNOWN', defaultRule: '未分類' },
  { key: '5', label: '白の塔専用', short: '白の塔', defaultRule: '階層攻略' },
  { key: '6', label: '闘技場専用A', short: '闘技場A', defaultRule: 'クラスA' },
  { key: '7', label: '闘技場専用B', short: '闘技場B', defaultRule: 'クラスB' },
  { key: '8', label: '闘技場専用C', short: '闘技場C', defaultRule: 'クラスC' },
  { key: '9', label: 'ロイヤル専用', short: 'ロイヤル', defaultRule: 'コスト195' },
  { key: 'a', label: 'グローリー専用', short: 'グローリー', defaultRule: '専用ルール' },
];

export const GROUP_BY_KEY = Object.fromEntries(GROUP_ITEMS.map((item) => [item.key, item]));

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

// OTELLIA実データ (character-attributes.json) の実在ID・ステータスに基づくサンプル駒
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

export function calcDeckSummary(deck, costModifiers = []) {
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

    const delta = costModifiers.reduce((acc, mod) => {
      if (mod.sealId === ch.type && mod.rarityBucket === bucket) {
        return acc + Number(mod.delta || 0);
      }
      return acc;
    }, 0);
    adjustedCost += Math.max(0, ch.cost + delta);
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

export const SAMPLE_DECKS = [
  {
    id: 'deck-season-god',
    deckCode: 'A3f9K2mQx8Lp4Z1nW7vB',
    name: '天界耐久ゼウス軸',
    groupKey: '3',
    deckType: 'god',
    comment: 'オーラ2枚＋回復連打。先攻は辺置きでHP維持し、終盤のゼウスコンボで詰め切る。',
    createdAt: '2026-11-12',
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
    deckCode: 'C2k7M9pRt4Xy6Q3wN1vE',
    name: '今月カップ闘士混合',
    groupKey: '2',
    deckType: 'mixed',
    comment: 'S闘士-2・A闘士+1想定のカップ戦構築。B1枠でコスト180ぴったり調整。',
    createdAt: '2026-11-18',
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
    deckCode: 'Gaf4R8nTz2Wc5H9yL6mP',
    name: '鈴音毒バフ魔単',
    groupKey: 'a',
    deckType: 'devil',
    comment: 'グローリー環境向けの魔統一。序盤から毒ダメージを重ねて中盤でリーサル。',
    createdAt: '2026-11-15',
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
    deckCode: 'R9d3W6vBn1Jk8S4qM5xT',
    name: 'エレノア竜速攻195',
    groupKey: '9',
    deckType: 'dragon',
    comment: 'ロイヤルコスト195対応。B2枠で回転率を確保し、4〜5ターン決着を狙う。',
    createdAt: '2026-11-10',
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
    deckCode: 'B1p5L8cVn3Qz7R2wK9mD',
    name: '神魔竜ハイブリッド',
    groupKey: '1',
    deckType: 'mixed',
    comment: '汎用バランス型。各属性の役割分担が明確で、対面の型を問わず対応可能。',
    createdAt: '2026-11-04',
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
    deckCode: 'T0z2X4mNb6Vw8C1kP3qL',
    name: '新規構築メモ（仮組）',
    groupKey: '0',
    deckType: 'other',
    comment: '空き枠4つあり。後半のA枠を闘士にするか天界にするか検証中。',
    createdAt: '2026-11-19',
    leaderId: 8210,
    subs: [
      8167, 8183,
      8174, 8206, 8211, 8212,
      8192, 8200, 450, 8115,
      3092, null, null, null, null,
    ],
  },
];
