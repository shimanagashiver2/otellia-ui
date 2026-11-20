'use client';

import { useState } from 'react';
import { BG_PATTERN_OPTIONS } from '@/design-versions/defaults';
import { MONO_FONT_OPTIONS, UI_FONT_OPTIONS } from '@/design-versions/fonts';

export const LAB_SECTIONS = [
  { id: 'all', label: 'すべて' },
  { id: 'tokens', label: '1. 背景・角丸・フォント' },
  { id: 'nested', label: '2. 入れ子脱却 & ミキサー' },
  { id: 'matrix', label: '3. 4×4ブロック色' },
  { id: 'gradients', label: '4. グループグラデ' },
  { id: 'deck-preview', label: '5. グループ表 & 実戦モック' },
  { id: 'components', label: '6. 共通UIパーツ' },
];

export default function LabControlBar({
  versions,
  activeVersion,
  onSelectVersion,
  onCloneVersion,
  onRenameVersion,
  onDeleteVersion,
  onResetVersion,
  onChangeBgPattern,
  onChangeUiFont,
  onChangeMonoFont,
  themeMode,
  onChangeThemeMode,
  viewportWidth,
  onChangeViewportWidth,
  activeSection,
  onChangeSection,
  onOpenExport,
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const startRename = () => {
    setNameDraft(activeVersion.name);
    setRenaming(true);
  };

  const commitRename = (e) => {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (trimmed) onRenameVersion(activeVersion.id, trimmed);
    setRenaming(false);
  };

  return (
    <section className="lab-control-bar" aria-label="デザイン検証コントロールバー">
      <div className="lab-control-row">
        <div className="lab-control-group is-version">
          <label htmlFor="version-select" className="ctrl-label">
            VERSION
          </label>
          {renaming ? (
            <form className="rename-form" onSubmit={commitRename}>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="ctrl-input"
                aria-label="バージョン名"
                autoFocus
              />
              <button type="submit" className="ctrl-btn is-primary">
                確定
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setRenaming(false)}
              >
                取消
              </button>
            </form>
          ) : (
            <>
              <select
                id="version-select"
                className="ctrl-select"
                value={activeVersion.id}
                onChange={(e) => onSelectVersion(e.target.value)}
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.builtin ? '' : '★'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ctrl-btn is-primary"
                onClick={() => onCloneVersion(activeVersion)}
                title="今の設定を複製して新バージョンを作る"
              >
                ＋ 複製して新案作成
              </button>
              <button type="button" className="ctrl-btn" onClick={startRename}>
                名前変更
              </button>
              {activeVersion.builtin ? (
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => onResetVersion(activeVersion.id)}
                  title="このビルトイン案を初期値に戻す"
                >
                  初期値戻し
                </button>
              ) : (
                <button
                  type="button"
                  className="ctrl-btn is-danger"
                  onClick={() => onDeleteVersion(activeVersion.id)}
                >
                  削除
                </button>
              )}
            </>
          )}
        </div>

        <div className="lab-control-group">
          <span className="ctrl-label">THEME</span>
          <div className="ctrl-segmented" role="group" aria-label="テーマ表示モード">
            {[
              { id: 'system', label: 'OS追従' },
              { id: 'light', label: 'ライト' },
              { id: 'dark', label: 'ダーク' },
              { id: 'split', label: '同時比較' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={themeMode === item.id ? 'is-active' : ''}
                onClick={() => onChangeThemeMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-control-group">
          <span className="ctrl-label">WIDTH</span>
          <div className="ctrl-segmented" role="group" aria-label="プレビュー幅">
            {[
              { id: 'mobile', label: '375px' },
              { id: 'tablet', label: '768px' },
              { id: 'full', label: 'Full' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={viewportWidth === item.id ? 'is-active' : ''}
                onClick={() => onChangeViewportWidth(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-control-group">
          <label htmlFor="ctrl-bg-pattern" className="ctrl-label">
            BG
          </label>
          <select
            id="ctrl-bg-pattern"
            className="ctrl-select"
            value={activeVersion.shape?.bgPattern || 'none'}
            onChange={(e) => onChangeBgPattern(e.target.value)}
          >
            {BG_PATTERN_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lab-control-group is-fonts">
          <label htmlFor="ctrl-ui-font" className="ctrl-label">
            UI FONT
          </label>
          <select
            id="ctrl-ui-font"
            className="ctrl-select"
            value={activeVersion.fonts?.ui || 'ibm-plex-sans-jp'}
            onChange={(e) => onChangeUiFont(e.target.value)}
          >
            {UI_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>

          <label htmlFor="ctrl-mono-font" className="ctrl-label">
            NUM FONT
          </label>
          <select
            id="ctrl-mono-font"
            className="ctrl-select"
            value={activeVersion.fonts?.mono || 'ibm-plex-mono'}
            onChange={(e) => onChangeMonoFont(e.target.value)}
          >
            {MONO_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lab-control-group is-right">
          <button
            type="button"
            className="ctrl-btn is-accent"
            onClick={onOpenExport}
          >
            CSS / JSON 書き出し
          </button>
        </div>
      </div>

      <div className="lab-section-tabs" role="tablist" aria-label="検証セクション切り替え">
        {LAB_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            role="tab"
            aria-selected={activeSection === sec.id}
            className={`lab-sec-tab ${activeSection === sec.id ? 'is-active' : ''}`}
            onClick={() => onChangeSection(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </div>
    </section>
  );
}
