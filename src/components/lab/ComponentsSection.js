'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function ComponentsSection({ version, themeMode, viewportWidth }) {
  const [sampleTab, setSampleTab] = useState('warehouse');
  const [rangeVal, setRangeVal] = useState(195);
  const sampleDialogRef = useRef(null);

  useDialogLightDismiss(sampleDialogRef);

  return (
    <section className="lab-section" id="components">
      <div className="lab-section-head">
        <div>
          <span className="lab-kicker">SECTION 06 // SHARED UI KIT</span>
          <h2 className="lab-section-title">共通UIコンポーネント見本</h2>
          <p className="lab-section-desc">
            ボタン、入力フォーム、タブ、アラート、ネイティブ &lt;dialog&gt; モーダルまで、採用バージョンのトークンがどう馴染むかを確認します。
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
              <h4>ボタン &amp; タブ</h4>
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

              <div className="comp-tabs" role="tablist" aria-label="見本タブ">
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
              <h4>入力フォーム &amp; コントロール</h4>
              <div className="comp-form-stack">
                <div className="comp-input-row">
                  <input
                    type="text"
                    className="ui-input"
                    defaultValue="A3f9K2mQx8Lp4Z1nW7vB"
                    placeholder="デッキIDを入力..."
                    aria-label="デッキID見本"
                  />
                  <button type="button" className="ui-btn is-primary">
                    読込
                  </button>
                </div>

                <div className="comp-input-row">
                  <select className="ui-select" defaultValue="2" aria-label="グループ選択見本">
                    <option value="1">基本デッキ</option>
                    <option value="2">カップ戦専用</option>
                    <option value="3">シーズン専用</option>
                  </select>
                  <label className="comp-check">
                    <input type="checkbox" defaultChecked />
                    <span>リーダー変更モード</span>
                  </label>
                </div>

                <label className="slider-row">
                  <span>コスト上限</span>
                  <input
                    type="range"
                    min="150"
                    max="220"
                    step="5"
                    value={rangeVal}
                    onChange={(e) => setRangeVal(Number(e.target.value))}
                  />
                  <output className="num-tabular">{rangeVal}</output>
                </label>
              </div>
            </div>

            <div className="comp-card">
              <h4>通知・警告・モーダル</h4>
              <div className="comp-alerts">
                <div className="ui-alert is-info">
                  デッキIDを解析し、16体のステータスを計算しました。
                </div>
                <div className="ui-alert is-warning">
                  注意：不完全なデッキIDはゲーム内で読み込めない場合があります。
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
        )}
      />

      <dialog
        ref={sampleDialogRef}
        className="lab-dialog"
        closedby="any"
        aria-labelledby="sample-dialog-title"
      >
        <div className="dialog-header">
          <h3 id="sample-dialog-title">デッキ仕様ダイアログ（&lt;dialog&gt; サンプル）</h3>
          <form method="dialog">
            <button type="submit" value="close" className="ctrl-btn" aria-label="閉じる">
              ✕
            </button>
          </form>
        </div>
        <div className="dialog-body">
          <p>
            ネイティブ <code>&lt;dialog&gt;</code> 要素 + <code>showModal()</code> で構築されたモーダル例です。背景スクロール連鎖防止（<code>overscroll-behavior: contain</code>）や Esc / 外側クリック閉じに対応しています。
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
