'use client';

import { versionToStyleVars } from '@/design-versions/cssExport';

export default function PreviewSplitWrapper({
  version,
  themeMode,
  viewportWidth,
  renderContent,
}) {
  const widthClass = `is-${viewportWidth}`;

  if (themeMode === 'split') {
    return (
      <div className="split-compare-grid">
        <div
          className="split-pane theme-scope-light"
          style={versionToStyleVars(version, 'light')}
        >
          <div className="split-pane-head">
            <span className="split-badge">LIGHT MODE</span>
          </div>
          <div className={`preview-stage ${widthClass}`}>
            {renderContent('light')}
          </div>
        </div>

        <div
          className="split-pane theme-scope-dark"
          style={versionToStyleVars(version, 'dark')}
        >
          <div className="split-pane-head">
            <span className="split-badge">DARK MODE</span>
          </div>
          <div className={`preview-stage ${widthClass}`}>
            {renderContent('dark')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`preview-stage ${widthClass}`}>
      {renderContent(themeMode === 'dark' ? 'dark' : 'light')}
    </div>
  );
}
