'use client';

import { useState, useSyncExternalStore } from 'react';
import { buildGroupSpecsMarkdown } from '@/data/sampleDecks';
import { generateCssTokens } from '@/design-versions/cssExport';
import {
  getGroupNotesServerSnapshot,
  getGroupNotesSnapshot,
  subscribeGroupNotes,
} from '@/design-versions/labStore';
import { useDialogLightDismiss } from '@/lib/useDialogLightDismiss';
import { IconClose } from './UiIcons';

export default function ExportDialog({
  dialogRef,
  activeVersion,
  onImportVersionJson,
}) {
  const [tab, setTab] = useState('css');
  const [copied, setCopied] = useState(false);
  const [importDraft, setImportDraft] = useState('');
  const [importError, setImportError] = useState('');

  const groupNotes = useSyncExternalStore(
    subscribeGroupNotes,
    getGroupNotesSnapshot,
    getGroupNotesServerSnapshot
  );

  useDialogLightDismiss(dialogRef, () => {
    setImportError('');
  });

  const cssOutput = generateCssTokens(activeVersion);
  const jsonOutput = JSON.stringify(activeVersion, null, 2);
  const specsOutput = buildGroupSpecsMarkdown(groupNotes);

  const displayCode =
    tab === 'css' ? cssOutput : tab === 'specs' ? specsOutput : jsonOutput;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importDraft);
      onImportVersionJson(parsed);
      setImportDraft('');
      dialogRef.current?.close();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'JSONの解析に失敗しました');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="lab-dialog is-export"
      closedby="any"
      aria-labelledby="export-dialog-title"
    >
      <div className="dialog-header">
        <div>
          <h3 id="export-dialog-title">{activeVersion.name} のトークン書き出し</h3>
        </div>
        <form method="dialog">
          <button type="submit" value="close" className="ctrl-btn is-icon-only" aria-label="閉じる">
            <IconClose size={14} />
          </button>
        </form>
      </div>

      <div className="dialog-tabs comp-tabs is-underline">
        <button
          type="button"
          className={`comp-tab-btn ${tab === 'css' ? 'is-active' : ''}`}
          onClick={() => setTab('css')}
        >
          CSS変数 (globals.css用)
        </button>
        <button
          type="button"
          className={`comp-tab-btn ${tab === 'json' ? 'is-active' : ''}`}
          onClick={() => setTab('json')}
        >
          バージョンJSON
        </button>
        <button
          type="button"
          className={`comp-tab-btn ${tab === 'specs' ? 'is-active' : ''}`}
          onClick={() => setTab('specs')}
        >
          グループ仕様メモ
        </button>
        <button
          type="button"
          className={`comp-tab-btn ${tab === 'import' ? 'is-active' : ''}`}
          onClick={() => setTab('import')}
        >
          JSONインポート
        </button>
      </div>

      <div className="dialog-body">
        {tab === 'import' ? (
          <div className="import-box">
            <p className="import-hint">
              書き出したバージョンJSONを貼り付けると、新しいカスタムバージョンとして読み込まれます。
            </p>
            <textarea
              className="export-textarea"
              rows={12}
              value={importDraft}
              onChange={(e) => setImportDraft(e.target.value)}
              placeholder='{"name": "...", "themes": ...}'
              spellCheck={false}
            />
            {importError && <p className="ui-alert is-danger">{importError}</p>}
          </div>
        ) : (
          <textarea
            className="export-textarea"
            rows={16}
            value={displayCode}
            readOnly
            spellCheck={false}
            aria-label="書き出しコード"
          />
        )}
      </div>

      <div className="dialog-footer">
        {tab === 'import' ? (
          <button type="button" className="ui-btn is-primary" onClick={handleImport}>
            新案として読み込む
          </button>
        ) : (
          <button type="button" className="ui-btn is-primary" onClick={handleCopy}>
            {copied ? 'コピーしました！' : 'クリップボードにコピー'}
          </button>
        )}
        <form method="dialog">
          <button type="submit" value="cancel" className="ui-btn is-ghost">
            閉じる
          </button>
        </form>
      </div>
    </dialog>
  );
}
