'use client';

import { useEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/assetPath';
import PreviewSplitWrapper from './PreviewSplitWrapper';

function useDialogLightDismiss(dialogRef, onCloseDone) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      if (onCloseDone) onCloseDone();
    };
    dialog.addEventListener('close', handleClose);

    if ('closedBy' in HTMLDialogElement.prototype) {
      return () => dialog.removeEventListener('close', handleClose);
    }

    const isOutside = (event) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [dialogRef, onCloseDone]);
}

export { useDialogLightDismiss };

const DEMO_50_ID = 'A3f9K2mQx8Lp4Z1nW7vB6hTc9Yd2Rs5Fj8Mk4Np1Qw7Xz3Lu9';

export default function ComponentsSection({ version, themeMode, viewportWidth }) {
  const [sampleTab, setSampleTab] = useState('warehouse');
  const [tabVariant, setTabVariant] = useState('underline');
  const [deckIdSample, setDeckIdSample] = useState(DEMO_50_ID);
  const [deckNameSample, setDeckNameSample] = useState('混合：マナデッキ');
  const [commentSample, setCommentSample] = useState(
    'Ｓ闘士ー２・Ａ闘士＋１・ゼウス個別ー２想定のカップ戦用。Ｂ１枠で１８０ぴったりに調整'
  );
  const [rangeVal, setRangeVal] = useState(200);
  const sampleDialogRef = useRef(null);

  useDialogLightDismiss(sampleDialogRef);

  return (
    <section className="lab-section" id="components">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 06 // SHARED UI KIT</span>
          <h2 className="lab-section-title">共通UIコンポーネント見本（角丸統一・実戦仕様）</h2>
          <p className="lab-section-desc">
            「部品角丸 (badgeRadius)」と連動し、50桁ID省略バー・12文字/40文字カウンタ付きフォーム・下線タブ等の実用UIを確認できます。
          </p>
        </div>
      </div>

      <PreviewSplitWrapper
        version={version}
        themeMode={themeMode}
        viewportWidth={viewportWidth}
        renderContent={() => (
          <div className="components-grid">
            <div className="comp-card">
              <div className="comp-card-head">
                <h4>ボタン &amp; タブ比較</h4>
                <div className="ctrl-segmented">
                  <button
                    type="button"
                    className={tabVariant === 'underline' ? 'is-active' : ''}
                    onClick={() => setTabVariant('underline')}
                  >
                    下線型
                  </button>
                  <button
                    type="button"
                    className={tabVariant === 'box' ? 'is-active' : ''}
                    onClick={() => setTabVariant('box')}
                  >
                    ボックス型
                  </button>
                </div>
              </div>

              <div className="comp-row">
                <button type="button" className="ui-btn is-primary">
                  倉庫に保存
                </button>
                <button type="button" className="ui-btn is-secondary">
                  IDをコピー
                </button>
                <button type="button" className="ui-btn is-ghost">
                  キャンセル
                </button>
                <button type="button" className="ui-btn is-danger">
                  削除
                </button>
              </div>

              <div className={`comp-tabs is-${tabVariant}`} role="tablist" aria-label="見本タブ">
                {[
                  { id: 'warehouse', label: 'マイデッキ (6)' },
                  { id: 'editor', label: 'デッキ編集' },
                  { id: 'rules', label: '特殊ルール' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={sampleTab === t.id}
                    className={`comp-tab-btn ${sampleTab === t.id ? 'is-active' : ''}`}
                    onClick={() => setSampleTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="comp-card">
              <h4>50桁デッキIDバー &amp; 文字数制限入力</h4>
              <div className="comp-form-stack">
                <div className="deck-id-bar">
                  <input
                    type="text"
                    className="deck-id-input num-tabular"
                    value={deckIdSample}
                    onChange={(e) => setDeckIdSample(e.target.value)}
                    placeholder="50桁デッキIDをペースト..."
                    aria-label="50桁デッキID見本"
                  />
                  {deckIdSample && (
                    <button
                      type="button"
                      className="dc-icon-btn"
                      title="クリア"
                      onClick={() => setDeckIdSample('')}
                    >
                      <img src={assetPath('/images/icons/close.svg')} alt="クリア" className="ui-icon" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="dc-icon-btn"
                    title="貼り付け"
                    onClick={() => setDeckIdSample(DEMO_50_ID)}
                  >
                    <img src={assetPath('/images/icons/paste.svg')} alt="貼り付け" className="ui-icon" />
                  </button>
                  <button type="button" className="ui-btn is-primary">
                    読込
                  </button>
                </div>

                <label className="comp-field-label">
                  <div className="comp-field-meta">
                    <span>デッキ名</span>
                    <small className="num-tabular">{deckNameSample.length} / 12</small>
                  </div>
                  <input
                    type="text"
                    className="ui-input"
                    maxLength={12}
                    value={deckNameSample}
                    onChange={(e) => setDeckNameSample(e.target.value)}
                  />
                </label>

                <label className="comp-field-label">
                  <div className="comp-field-meta">
                    <span>コメント</span>
                    <small className="num-tabular">{commentSample.length} / 40</small>
                  </div>
                  <input
                    type="text"
                    className="ui-input"
                    maxLength={40}
                    value={commentSample}
                    onChange={(e) => setCommentSample(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="comp-card">
              <h4>実用コントロール &amp; 通知・モーダル</h4>
              <div className="comp-form-stack">
                <div className="comp-input-row">
                  <select className="ui-select" defaultValue="2" aria-label="グループ選択見本">
                    <option value="1">基本デッキ (200固定)</option>
                    <option value="2">カップ戦専用 (印/個別変動)</option>
                    <option value="6">闘技場専用A (最大320)</option>
                  </select>
                </div>

                <div className="comp-checks-row">
                  <label className="comp-check">
                    <input type="checkbox" defaultChecked />
                    <span>補正後コストで並び替え</span>
                  </label>
                  <label className="comp-check">
                    <input type="checkbox" defaultChecked />
                    <span>空き枠を後ろへ自動整頓</span>
                  </label>
                </div>

                <label className="slider-row">
                  <span>コスト上限</span>
                  <input
                    type="range"
                    min="150"
                    max="320"
                    step="5"
                    value={rangeVal}
                    onChange={(e) => setRangeVal(Number(e.target.value))}
                  />
                  <output className="num-tabular">{rangeVal}</output>
                </label>

                <div className="comp-alerts">
                  <div className="ui-alert is-info">
                    50桁IDを解析し、16体のステータスを計算しました。
                  </div>
                  <div className="ui-alert is-danger">
                    コストが上限（180）を 4 超過しています。
                  </div>
                </div>

                <div className="comp-row">
                  <button
                    type="button"
                    className="ui-btn is-secondary"
                    onClick={() => sampleDialogRef.current?.showModal()}
                  >
                    サンプルモーダルを開く (&lt;dialog&gt;)
                  </button>
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
          <h3 id="sample-dialog-title">デッキIDの仕様について（&lt;dialog&gt; サンプル）</h3>
          <form method="dialog">
            <button type="submit" value="close" className="ctrl-btn" aria-label="閉じる">
              ✕
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
