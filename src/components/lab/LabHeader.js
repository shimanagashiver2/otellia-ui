'use client';

import Logo from '@/components/Logo';
import ThemeIcon from '@/components/ThemeIcon';
import LoginIcon from '@/components/LoginIcon';

export default function LabHeader({ isDark, onToggleDark, activeVersionName }) {
  return (
    <header className="lab-site-header">
      <div className="lab-header-left">
        <a href="#top" className="lab-logo-link" aria-label="OTELLIA UI Design Lab トップ">
          <Logo />
        </a>
        <span className="lab-header-badge">UI DESIGN LAB</span>
      </div>

      <nav className="lab-header-nav" aria-label="サイトナビモック">
        <span className="lab-nav-item is-active">TOOLS</span>
        <span className="lab-nav-item">デッキ倉庫</span>
        <span className="lab-nav-item">文字生成</span>
        <span className="lab-nav-item">履歴書</span>
        <span className="lab-nav-item">ABOUT</span>
      </nav>

      <div className="lab-header-right">
        <span className="lab-version-chip" title={activeVersionName}>
          {activeVersionName}
        </span>
        <button
          type="button"
          className="lab-header-icon-btn"
          onClick={onToggleDark}
          title="ライト/ダーク切り替え"
          aria-label="ライト/ダーク切り替え"
        >
          <ThemeIcon isDark={isDark} />
        </button>
        <button
          type="button"
          className="lab-header-login-btn"
          aria-label="アカウントモック"
          title="アカウントモック"
        >
          <LoginIcon />
        </button>
      </div>
    </header>
  );
}
