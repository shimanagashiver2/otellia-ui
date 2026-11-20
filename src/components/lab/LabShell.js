'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  BUILTIN_VERSION_MAP,
  DEFAULT_ACTIVE_VERSION_ID,
  cloneVersion,
  normalizeVersion,
} from '@/design-versions/registry';
import { versionToStyleVars } from '@/design-versions/cssExport';
import {
  getLabServerSnapshot,
  getLabSnapshot,
  getSystemDarkServerSnapshot,
  getSystemDarkSnapshot,
  getThemeModeServerSnapshot,
  getThemeModeSnapshot,
  setThemeModePreference,
  subscribeLabStore,
  subscribeSystemDark,
  subscribeThemeMode,
  updateLabState,
} from '@/design-versions/labStore';
import LabHeader from './LabHeader';
import LabControlBar from './LabControlBar';
import TokensSection from './TokensSection';
import NestedCardLabSection from './NestedCardLabSection';
import MatrixLabSection from './MatrixLabSection';
import GroupGradientSection from './GroupGradientSection';
import DeckPreviewSection from './DeckPreviewSection';
import ComponentsSection from './ComponentsSection';
import ExportDialog from './ExportDialog';
import './Lab.css';

export default function LabShell() {
  const labState = useSyncExternalStore(
    subscribeLabStore,
    getLabSnapshot,
    getLabServerSnapshot
  );
  const themeMode = useSyncExternalStore(
    subscribeThemeMode,
    getThemeModeSnapshot,
    getThemeModeServerSnapshot
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  );

  const exportDialogRef = useRef(null);

  const effectiveDark =
    themeMode === 'dark' ? true : themeMode === 'light' ? false : systemDark;
  const effectiveMode = effectiveDark ? 'dark' : 'light';

  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      const content =
        themeMode === 'light' || themeMode === 'dark' ? themeMode : 'light dark';
      meta.setAttribute('content', content);
    }
    document.documentElement.classList.toggle('dark-mode', effectiveDark);
  }, [themeMode, effectiveDark]);

  const activeVersion = useMemo(
    () =>
      labState.versions.find((v) => v.id === labState.activeVersionId) ||
      labState.versions[0],
    [labState.versions, labState.activeVersionId]
  );

  const rootStyleVars = useMemo(
    () => versionToStyleVars(activeVersion, effectiveMode),
    [activeVersion, effectiveMode]
  );

  const mutateActiveVersion = (mutator) => {
    updateLabState((prev) => ({
      ...prev,
      versions: prev.versions.map((v) =>
        v.id === activeVersion.id ? mutator(v) : v
      ),
    }));
  };

  const handleToggleHeaderDark = () => {
    if (themeMode === 'split') {
      setThemeModePreference(systemDark ? 'light' : 'dark');
      return;
    }
    const targetDark = !effectiveDark;
    if (targetDark === systemDark) {
      setThemeModePreference('system');
    } else {
      setThemeModePreference(targetDark ? 'dark' : 'light');
    }
  };

  const handleSelectVersion = (id) => {
    updateLabState((prev) => ({ ...prev, activeVersionId: id }));
  };

  const handleCloneVersion = (base) => {
    const cloned = cloneVersion(base);
    updateLabState((prev) => ({
      ...prev,
      versions: [...prev.versions, cloned],
      activeVersionId: cloned.id,
    }));
  };

  const handleRenameVersion = (id, nextName) => {
    updateLabState((prev) => ({
      ...prev,
      versions: prev.versions.map((v) => (v.id === id ? { ...v, name: nextName } : v)),
    }));
  };

  const handleDeleteVersion = (id) => {
    updateLabState((prev) => {
      const remaining = prev.versions.filter((v) => v.id !== id);
      return {
        ...prev,
        versions: remaining,
        activeVersionId:
          prev.activeVersionId === id
            ? remaining[0]?.id || DEFAULT_ACTIVE_VERSION_ID
            : prev.activeVersionId,
      };
    });
  };

  const handleResetVersion = (id) => {
    const original = BUILTIN_VERSION_MAP[id];
    if (!original) return;
    updateLabState((prev) => ({
      ...prev,
      versions: prev.versions.map((v) =>
        v.id === id ? normalizeVersion(structuredClone(original), original) : v
      ),
    }));
  };

  const handleImportVersionJson = (parsed) => {
    const imported = cloneVersion(
      normalizeVersion(parsed, activeVersion),
      parsed.name ? `${parsed.name} (読込)` : undefined
    );
    updateLabState((prev) => ({
      ...prev,
      versions: [...prev.versions, imported],
      activeVersionId: imported.id,
    }));
  };

  const showSection = (id) =>
    labState.activeSection === 'all' || labState.activeSection === id;

  return (
    <div className="lab-root" id="top" style={rootStyleVars}>
      <LabHeader
        isDark={effectiveDark}
        onToggleDark={handleToggleHeaderDark}
        activeVersionName={activeVersion.name}
      />

      <main className="lab-main">
        <div className="lab-hero-strip">
          <div className="lab-hero-copy">
            <h1>OTELLIA UI Design Lab</h1>
            <p>{activeVersion.description}</p>
          </div>
          <div className="lab-hero-meta num-tabular">
            <span>PATTERN: {activeVersion.cardPattern}</span>
            <span>GROUP: {activeVersion.groupApplyMode}</span>
            <span>UI: {activeVersion.fonts?.ui || 'ibm-plex-sans-jp'}</span>
            <span>NUM: {activeVersion.fonts?.mono || 'ibm-plex-mono'}</span>
          </div>
        </div>

        <LabControlBar
          versions={labState.versions}
          activeVersion={activeVersion}
          onSelectVersion={handleSelectVersion}
          onCloneVersion={handleCloneVersion}
          onRenameVersion={handleRenameVersion}
          onDeleteVersion={handleDeleteVersion}
          onResetVersion={handleResetVersion}
          onChangeBgPattern={(pattern) =>
            mutateActiveVersion((v) => ({
              ...v,
              shape: { ...v.shape, bgPattern: pattern },
            }))
          }
          onChangeUiFont={(fontId) =>
            mutateActiveVersion((v) => ({
              ...v,
              fonts: { ...v.fonts, ui: fontId },
            }))
          }
          onChangeMonoFont={(fontId) =>
            mutateActiveVersion((v) => ({
              ...v,
              fonts: { ...v.fonts, mono: fontId },
            }))
          }
          themeMode={themeMode}
          onChangeThemeMode={setThemeModePreference}
          viewportWidth={labState.viewportWidth}
          onChangeViewportWidth={(w) =>
            updateLabState((prev) => ({ ...prev, viewportWidth: w }))
          }
          activeSection={labState.activeSection}
          onChangeSection={(sec) =>
            updateLabState((prev) => ({ ...prev, activeSection: sec }))
          }
          onOpenExport={() => exportDialogRef.current?.showModal()}
        />

        {showSection('tokens') && (
          <TokensSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
            onUpdateThemeColor={(mode, key, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                themes: {
                  ...v.themes,
                  [mode]: { ...v.themes[mode], [key]: val },
                },
              }))
            }
            onUpdateShape={(key, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                shape: { ...v.shape, [key]: val },
              }))
            }
            onResetAllRadiusZero={() =>
              mutateActiveVersion((v) => ({
                ...v,
                shape: { ...v.shape, cardRadius: 0, innerRadius: 0, badgeRadius: 0 },
              }))
            }
            onChangeUiFont={(fontId) =>
              mutateActiveVersion((v) => ({
                ...v,
                fonts: { ...v.fonts, ui: fontId },
              }))
            }
            onChangeMonoFont={(fontId) =>
              mutateActiveVersion((v) => ({
                ...v,
                fonts: { ...v.fonts, mono: fontId },
              }))
            }
          />
        )}

        {showSection('nested') && (
          <NestedCardLabSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
            onSelectCardPattern={(pat) =>
              mutateActiveVersion((v) => ({ ...v, cardPattern: pat }))
            }
            onChangeGroupApplyMode={(mode) =>
              mutateActiveVersion((v) => ({ ...v, groupApplyMode: mode }))
            }
            onUpdateMatrixConfig={(key, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                matrix: { ...v.matrix, [key]: val },
              }))
            }
            onUpdateCardMixer={(key, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                cardMixer: { ...v.cardMixer, [key]: val },
              }))
            }
          />
        )}

        {showSection('matrix') && (
          <MatrixLabSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
            onUpdateAttributeColor={(mode, attr, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                attributes: {
                  ...v.attributes,
                  [mode]: { ...v.attributes[mode], [attr]: val },
                },
              }))
            }
            onUpdateRarityBorderColor={(mode, bucket, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                rarityBorders: {
                  ...v.rarityBorders,
                  [mode]: { ...v.rarityBorders[mode], [bucket]: val },
                },
              }))
            }
            onApplyRarityPreset={(preset) =>
              mutateActiveVersion((v) => ({
                ...v,
                rarityBorders: {
                  light: { ...preset.light },
                  dark: { ...preset.dark },
                },
              }))
            }
            onUpdateMatrixConfig={(key, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                matrix: { ...v.matrix, [key]: val },
              }))
            }
          />
        )}

        {showSection('gradients') && (
          <GroupGradientSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
            onUpdateGroupGradient={(groupKey, field, val) =>
              mutateActiveVersion((v) => ({
                ...v,
                groupGradients: {
                  ...v.groupGradients,
                  [groupKey]: { ...v.groupGradients[groupKey], [field]: val },
                },
              }))
            }
            onChangeGroupApplyMode={(mode) =>
              mutateActiveVersion((v) => ({ ...v, groupApplyMode: mode }))
            }
          />
        )}

        {showSection('deck-preview') && (
          <DeckPreviewSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
          />
        )}

        {showSection('components') && (
          <ComponentsSection
            version={activeVersion}
            themeMode={themeMode === 'split' ? 'split' : effectiveMode}
            viewportWidth={labState.viewportWidth}
          />
        )}
      </main>

      <ExportDialog
        dialogRef={exportDialogRef}
        activeVersion={activeVersion}
        onImportVersionJson={handleImportVersionJson}
      />
    </div>
  );
}
