'use client';

import { useRef, useState } from 'react';
import { GROUP_ITEMS } from '@/data/sampleDecks';
import { assetPath } from '@/lib/assetPath';
import { useDialogLightDismiss } from '@/lib/useDialogLightDismiss';
import PreviewSplitWrapper from './PreviewSplitWrapper';
import {
  IconClose,
  IconCopy,
  IconDanger,
  IconInfo,
  IconSave,
  IconSuccess,
  IconTrash,
  IconWarning,
} from './UiIcons';

const DEMO_50_ID = 'A3f9K2mQx8Lp4Z1nW7vB6hTc9Yd2Rs5Fj8Mk4Np1Qw7Xz3Lu9';

const UI_FINISH_PRESETS = [
  {
    id: 'precision',
    label: 'Precision（Oxide / Linear系）',
    desc: '1pxヘアライン枠＋控えめな立体影＋押下で1px沈む精密計器仕上げ',
  },
  {
    id: 'carbon',
    label: 'Carbon（IBM Carbon系）',
    desc: '影を完全に排したフラット架構。入力欄の底面ラインアクセントと高コントラスト黒白軸',
  },
  {
    id: 'tactile',
    label: 'Tactile（研究端末キー系）',
    desc: '上端の微細ハイライトと明瞭な境界コントラストで物理スイッチ的な手触りを付与',
  },
];

const INITIAL_ALERTS = [
  {
    id: 'info',
    tone: 'info',
    title: 'デッキID解析完了',
    message: '50桁IDから16体の基本ステータス・総コストを算出しました。',
  },
  {
    id: 'success',
    tone: 'success',
    title: 'カップ戦ルール適合',
    message: '調整後コスト 159 / 160、S枠・B枠の制限条件を満たしています。',
  },
  {
    id: 'warning',
    tone: 'warning',
    title: 'S/S+ 枚数超過',
    message: 'カップ戦上限（2枚）に対し 3枚編成されています。1枚をA+以下へ入れ替えてください。',
  },
  {
    id: 'danger',
    tone: 'danger',
    title: 'コスト上限超過 (+4)',
    message: '調整後コストが上限（160）を超えています。合計4コスト分を削減してください。',
  },
];

export default function ComponentsSection({
  version,
  themeMode,
  viewportWidth,
  onChangeUiFinish,
}) {
  const [sampleTab, setSampleTab] = useState('warehouse');
  const [deckIdSample, setDeckIdSample] = useState(DEMO_50_ID);
  const [deckNameSample, setDeckNameSample] = useState('混合：マナデッキ');
  const [selectedGroupKey, setSelectedGroupKey] = useState('2');
  const [commentSample, setCommentSample] = useState(
    'Ｓ闘士ー２・Ａ闘士＋１・ゼウス個別ー２想定のカップ戦用。Ｂ１枠で１６０〜調整'
  );
  const [rangeVal, setRangeVal] = useState(180);
  const [forceInvalidDemo, setForceInvalidDemo] = useState(false);
  const [sortChecked, setSortChecked] = useState(true);
  const [compactChecked, setCompactChecked] = useState(true);
  const [toggleRealtime, setToggleRealtime] = useState(true);
  const [isSavingDemo, setIsSavingDemo] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const sampleDialogRef = useRef(null);
  useDialogLightDismiss(sampleDialogRef);

  const uiFinish = version.uiFinish || 'precision';
  const nameTrimmed = deckNameSample.trim();
  const isNameInvalid = forceInvalidDemo || nameTrimmed.length === 0;
  const rangePct = Math.round(((rangeVal - 150) / (320 - 150)) * 100);

  const handleLoadingDemo = () => {
    if (isSavingDemo) return;
    setIsSavingDemo(true);
    window.setTimeout(() => setIsSavingDemo(false), 1200);
  };

  const visibleAlerts = INITIAL_ALERTS.filter((a) => !dismissedAlerts.includes(a.id));

  const renderAlertIcon = (tone) => {
    if (tone === 'success') return <IconSuccess size={16} />;
    if (tone === 'warning') return <IconWarning size={16} />;
    if (tone === 'danger') return <IconDanger size={16} />;
    return <IconInfo size={16} />;
  };

  return (
    <section className="lab-section" id="components">
      <div className="lab-section-head">
        <div>
          <h2 className="lab-section-title">6. 共通UIコンポーネント（精密フォーム・下線タブ・左帯通知）</h2>
          <p className="lab-section-desc">
            下線型タブ・左帯型通知を軸に、カスタムセレクト／チェックボックス／進捗スライダー、8状態ボタン（Loading/Disabled/Focus/Error含む）、質感3パターンを比較できます。
          </p>
        </div>
      </div>

      {/* 質感プリセット切替バー */}
      <div className="mixer-bar">
        <div className="mixer-item">
          <span className="ctrl-label">共通UI質感</span>
          <div className="ctrl-segmented" role="radiogroup" aria-label="共通UIの質感スタイル">
            {UI_FINISH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={uiFinish === preset.id ? 'is-active' : ''}
                onClick={() => onChangeUiFinish && onChangeUiFinish(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <span className="ui-finish-note">
          {UI_FINISH_PRESETS.find((p) => p.id === uiFinish)?.desc}
        </span>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="anti-slop-kit" data-ui-finish={uiFinish}>
            <div className="kit-asymmetric-grid">
              {/* 左列：入力・編集フォーム実戦セット */}
              <div className="kit-surface-block">
                <div className="kit-block-head">
                  <h4>実戦フォーム部品 &amp; バリデーション状態</h4>
                  <button
                    type="button"
                    className={`ctrl-btn is-xs ${forceInvalidDemo ? 'is-accent' : ''}`}
                    onClick={() => setForceInvalidDemo((v) => !v)}
                  >
                    {forceInvalidDemo ? 'エラー状態を解除' : 'エラー表示を確認'}
                  </button>
                </div>

                <div className="deck-id-bar">
                  <input
                    type="text"
                    className="deck-id-input num-tabular"
                    value={deckIdSample}
                    onChange={(e) => setDeckIdSample(e.target.value)}
                    placeholder="50桁デッキIDをペースト"
                    aria-label="50桁デッキID見本"
                  />
                  {deckIdSample && (
                    <button
                      type="button"
                      className="dc-icon-btn"
                      title="クリア"
                      aria-label="クリア"
                      onClick={() => setDeckIdSample('')}
                    >
                      <img src={assetPath('/images/icons/close.svg')} alt="" className="ui-icon" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="dc-icon-btn"
                    title="貼り付け"
                    aria-label="貼り付け"
                    onClick={() => setDeckIdSample(DEMO_50_ID)}
                  >
                    <img src={assetPath('/images/icons/paste.svg')} alt="" className="ui-icon" />
                  </button>
                  <button type="button" className="ui-btn is-primary">
                    読込
                  </button>
                </div>

                <div className="kit-divider" />

                <div className="kit-form-two-col">
                  <label className="comp-field-label">
                    <div className="comp-field-meta">
                      <span>デッキ名</span>
                      <small className="num-tabular">{deckNameSample.length}/12</small>
                    </div>
                    <input
                      type="text"
                      className="ui-input"
                      maxLength={12}
                      value={deckNameSample}
                      aria-invalid={isNameInvalid || undefined}
                      aria-describedby={isNameInvalid ? 'deck-name-err' : undefined}
                      onChange={(e) => setDeckNameSample(e.target.value)}
                    />
                    {isNameInvalid && (
                      <span id="deck-name-err" className="field-error-text">
                        1〜12文字でデッキ名を入力してください
                      </span>
                    )}
                  </label>

                  <label className="comp-field-label">
                    <div className="comp-field-meta">
                      <span>グループ</span>
                      <small>ID先頭判定</small>
                    </div>
                    <select
                      className="ui-select"
                      value={selectedGroupKey}
                      onChange={(e) => setSelectedGroupKey(e.target.value)}
                      aria-label="グループ選択見本"
                    >
                      {GROUP_ITEMS.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="comp-field-label">
                  <div className="comp-field-meta">
                    <span>コメント</span>
                    <small className="num-tabular">{commentSample.length}/40</small>
                  </div>
                  <input
                    type="text"
                    className="ui-input"
                    maxLength={40}
                    value={commentSample}
                    onChange={(e) => setCommentSample(e.target.value)}
                  />
                </label>

                <div className="kit-divider" />

                <div className="comp-checks-row">
                  <label className="comp-check">
                    <input
                      type="checkbox"
                      checked={sortChecked}
                      onChange={(e) => setSortChecked(e.target.checked)}
                    />
                    <span>ATK / HP 切替時にサブ15体を降順ソート</span>
                  </label>
                  <label className="comp-check">
                    <input
                      type="checkbox"
                      checked={compactChecked}
                      onChange={(e) => setCompactChecked(e.target.checked)}
                    />
                    <span>空き枠を後ろへ自動整頓してID発行</span>
                  </label>
                  <label className="comp-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={toggleRealtime}
                      onChange={(e) => setToggleRealtime(e.target.checked)}
                    />
                    <span className="switch-track" aria-hidden="true">
                      <span className="switch-thumb" />
                    </span>
                    <span className="switch-label">編集中にコスト合計をリアルタイム検算</span>
                  </label>
                </div>

                <label className="slider-row is-range-filled">
                  <span>コスト上限</span>
                  <input
                    type="range"
                    min="150"
                    max="320"
                    step="5"
                    value={rangeVal}
                    style={{ '--range-pct': `${rangePct}%` }}
                    onChange={(e) => setRangeVal(Number(e.target.value))}
                  />
                  <output className="num-tabular">{rangeVal}</output>
                </label>
              </div>

              {/* 右列：8状態ボタン・下線タブ・左帯通知 */}
              <div className="kit-surface-block">
                <div className="kit-block-head">
                  <h4>ボタン階層・操作状態</h4>
                  <button
                    type="button"
                    className="ui-btn is-secondary is-sm"
                    onClick={() => sampleDialogRef.current?.showModal()}
                  >
                    ダイアログ確認
                  </button>
                </div>

                <div className="comp-row">
                  <button
                    type="button"
                    className={`ui-btn is-primary ${isSavingDemo ? 'is-loading' : ''}`}
                    aria-busy={isSavingDemo || undefined}
                    onClick={handleLoadingDemo}
                  >
                    <IconSave size={14} />
                    <span>{isSavingDemo ? '保存中…' : '倉庫に保存'}</span>
                  </button>
                  <button type="button" className="ui-btn is-secondary">
                    <IconCopy size={14} />
                    <span>IDをコピー</span>
                  </button>
                  <button type="button" className="ui-btn is-ghost">
                    キャンセル
                  </button>
                  <button type="button" className="ui-btn is-danger">
                    <IconTrash size={14} />
                    <span>削除</span>
                  </button>
                  <button type="button" className="ui-btn is-secondary" disabled>
                    保存済み（Disabled）
                  </button>
                </div>

                <div className="kit-divider" />

                <div className="kit-block-head">
                  <h4>下線型タブ（採用ベース）</h4>
                </div>

                <div className="comp-tabs-wrap">
                  <div className="comp-tabs is-underline" role="tablist" aria-label="見本タブ">
                    {[
                      { id: 'warehouse', label: 'マイデッキ', count: '6' },
                      { id: 'editor', label: 'デッキ編集', count: '16' },
                      { id: 'rules', label: 'コストルール', count: '3' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={sampleTab === t.id}
                        className={`comp-tab-btn ${sampleTab === t.id ? 'is-active' : ''}`}
                        onClick={() => setSampleTab(t.id)}
                      >
                        <span>{t.label}</span>
                        <span className="tab-count num-tabular">{t.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="comp-tab-panel" role="tabpanel">
                    {sampleTab === 'warehouse' &&
                      '保存済みデッキの一覧表示・グループ絞り込み・コピーを実行するビューです。'}
                    {sampleTab === 'editor' &&
                      '50桁IDの解析・16枠の駒入れ替え・5項目表示切替を行うビューです。'}
                    {sampleTab === 'rules' &&
                      'カップ戦・白の塔・闘技場のコスト上限と印/個別増減ルールを設定するビューです。'}
                  </div>
                </div>

                <div className="kit-divider" />

                <div className="kit-block-head">
                  <h4>左帯型通知（構造・コントラスト改良版）</h4>
                  {dismissedAlerts.length > 0 && (
                    <button
                      type="button"
                      className="ctrl-btn is-xs"
                      onClick={() => setDismissedAlerts([])}
                    >
                      通知を戻す
                    </button>
                  )}
                </div>

                <div className="comp-alerts">
                  {visibleAlerts.map((item) => (
                    <div key={item.id} className={`ui-alert is-${item.tone}`} role="status">
                      <span className="alert-icon">{renderAlertIcon(item.tone)}</span>
                      <div className="alert-content">
                        <strong className="alert-title">{item.title}</strong>
                        <p className="alert-msg">{item.message}</p>
                      </div>
                      <button
                        type="button"
                        className="alert-close"
                        onClick={() => setDismissedAlerts((prev) => [...prev, item.id])}
                        aria-label={`${item.title}を閉じる`}
                      >
                        <IconClose size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      />

      <dialog
        ref={sampleDialogRef}
        className="lab-dialog"
        closedby="any"
        aria-labelledby="sample-dialog-title"
      >
        <div className="dialog-header">
          <h3 id="sample-dialog-title">デッキIDの仕様について（モーダル例）</h3>
          <form method="dialog">
            <button type="submit" value="close" className="ctrl-btn is-icon-only" aria-label="閉じる">
              <IconClose size={14} />
            </button>
          </form>
        </div>
        <div className="dialog-body">
          <p>
            OTELLIAでは16体未満の仮組デッキでもID発行・保存が可能ですが、ゲーム内（逆転オセロニア）で読み込む際は16枠すべて埋まっている必要があります。
          </p>
        </div>
        <div className="dialog-footer">
          <form method="dialog">
            <button type="submit" value="cancel" className="ui-btn is-primary" autoFocus>
              閉じる
            </button>
          </form>
        </div>
      </dialog>
    </section>
  );
}
