import {
  BUILTIN_VERSION_MAP,
  DEFAULT_ACTIVE_VERSION_ID,
  LAB_STORAGE_KEY,
  createInitialVersions,
  getInitialLabState,
  normalizeVersion,
} from './registry';

const COLOR_SCHEME_KEY = 'otellia-ui-color-scheme';
const THEME_MODE_KEY = 'otellia-ui-theme-mode';
const GROUP_NOTES_KEY = 'otellia-ui-group-notes-v1';
const SCHEMA_MIGRATION_KEY = 'otellia-ui-v4-rev2';

const SERVER_LAB_SNAPSHOT = getInitialLabState();
let clientLabCache = null;
const labListeners = new Set();

function parseStoredLabState() {
  if (typeof window === 'undefined') return SERVER_LAB_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(SCHEMA_MIGRATION_KEY, '1');
      return getInitialLabState();
    }
    const parsed = JSON.parse(raw);
    const rawVersions = Array.isArray(parsed.versions) ? parsed.versions : [];
    const migratedRev2 = window.localStorage.getItem(SCHEMA_MIGRATION_KEY) === '1';

    let normalized = rawVersions
      .filter((v) => v && typeof v === 'object')
      .map((v) => normalizeVersion(v, BUILTIN_VERSION_MAP[v.id]));

    const existingIds = new Set(normalized.map((v) => v.id));
    const missingBuiltins = createInitialVersions().filter(
      (b) => !existingIds.has(b.id)
    );
    normalized = [...missingBuiltins, ...normalized];

    if (!migratedRev2) {
      const freshV4 = BUILTIN_VERSION_MAP[DEFAULT_ACTIVE_VERSION_ID];
      normalized = normalized.map((v) =>
        v.id === DEFAULT_ACTIVE_VERSION_ID
          ? normalizeVersion(structuredClone(freshV4), freshV4)
          : v
      );
      window.localStorage.setItem(SCHEMA_MIGRATION_KEY, '1');
    }

    const activeId = !migratedRev2
      ? DEFAULT_ACTIVE_VERSION_ID
      : normalized.some((v) => v.id === parsed.activeVersionId)
      ? parsed.activeVersionId
      : DEFAULT_ACTIVE_VERSION_ID;

    return {
      versions: normalized,
      activeVersionId: activeId,
      viewportWidth: parsed.viewportWidth || 'full',
      activeSection: parsed.activeSection || 'all',
    };
  } catch {
    return getInitialLabState();
  }
}

export function getLabSnapshot() {
  if (typeof window === 'undefined') return SERVER_LAB_SNAPSHOT;
  if (!clientLabCache) {
    clientLabCache = parseStoredLabState();
  }
  return clientLabCache;
}

export function getLabServerSnapshot() {
  return SERVER_LAB_SNAPSHOT;
}

export function subscribeLabStore(listener) {
  labListeners.add(listener);
  const handleStorage = (e) => {
    if (e.key === LAB_STORAGE_KEY) {
      clientLabCache = parseStoredLabState();
      labListeners.forEach((fn) => fn());
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    labListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function updateLabState(updater) {
  const prev = getLabSnapshot();
  const next = typeof updater === 'function' ? updater(prev) : updater;
  clientLabCache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }
  labListeners.forEach((fn) => fn());
}

// --- グループ仕様テーブルのカスタムメモ永続化 ---
const SERVER_NOTES = {};
let clientNotesCache = null;
const notesListeners = new Set();

function readNotes() {
  if (typeof window === 'undefined') return SERVER_NOTES;
  try {
    const raw = window.localStorage.getItem(GROUP_NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getGroupNotesSnapshot() {
  if (typeof window === 'undefined') return SERVER_NOTES;
  if (!clientNotesCache) clientNotesCache = readNotes();
  return clientNotesCache;
}

export function getGroupNotesServerSnapshot() {
  return SERVER_NOTES;
}

export function subscribeGroupNotes(listener) {
  notesListeners.add(listener);
  return () => notesListeners.delete(listener);
}

export function updateGroupNote(groupKey, note) {
  const prev = getGroupNotesSnapshot();
  const next = { ...prev, [groupKey]: note };
  clientNotesCache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GROUP_NOTES_KEY, JSON.stringify(next));
    } catch {}
  }
  notesListeners.forEach((fn) => fn());
}

// --- テーマモード (system | light | dark | split) ---
const themeListeners = new Set();
let clientThemeCache = null;

function readThemeMode() {
  if (typeof window === 'undefined') return 'system';
  try {
    const savedUiMode = window.localStorage.getItem(THEME_MODE_KEY);
    if (savedUiMode === 'split') return 'split';
    const savedScheme = window.localStorage.getItem(COLOR_SCHEME_KEY);
    if (savedScheme === 'light' || savedScheme === 'dark') return savedScheme;
    return 'system';
  } catch {
    return 'system';
  }
}

export function getThemeModeSnapshot() {
  if (typeof window === 'undefined') return 'system';
  if (!clientThemeCache) clientThemeCache = readThemeMode();
  return clientThemeCache;
}

export function getThemeModeServerSnapshot() {
  return 'system';
}

export function subscribeThemeMode(listener) {
  themeListeners.add(listener);
  const handleStorage = (e) => {
    if (e.key === COLOR_SCHEME_KEY || e.key === THEME_MODE_KEY) {
      clientThemeCache = readThemeMode();
      themeListeners.forEach((fn) => fn());
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    themeListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function setThemeModePreference(nextMode) {
  clientThemeCache = nextMode;
  if (typeof window !== 'undefined') {
    try {
      if (nextMode === 'split') {
        window.localStorage.setItem(THEME_MODE_KEY, 'split');
      } else {
        window.localStorage.removeItem(THEME_MODE_KEY);
        if (nextMode === 'light' || nextMode === 'dark') {
          window.localStorage.setItem(COLOR_SCHEME_KEY, nextMode);
        } else {
          window.localStorage.removeItem(COLOR_SCHEME_KEY);
        }
      }
    } catch {}
  }
  themeListeners.forEach((fn) => fn());
}

// --- システム OS の prefers-color-scheme 購読 ---
export function getSystemDarkSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getSystemDarkServerSnapshot() {
  return false;
}

export function subscribeSystemDark(listener) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}
