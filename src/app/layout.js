import localFont from 'next/font/local';
import './globals.css';

const otelliaFont = localFont({
  src: '../fonts/otellia.otf',
  variable: '--font-otellia',
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const UI_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=BIZ+UDGothic:wght@400;700&family=BIZ+UDPGothic:wght@400;700&family=IBM+Plex+Sans+JP:wght@400;600;700&family=Inter:wght@400;600;700;800&family=M+PLUS+1+Code:wght@400;700&family=M+PLUS+1p:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap';

const MONO_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;700&family=Barlow+Condensed:wght@500;700&family=Chakra+Petch:wght@400;700&family=Chivo+Mono:wght@400;700&family=Fira+Code:wght@400;700&family=Geist+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;600;700&family=Inconsolata:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Red+Hat+Mono:wght@400;700&family=Roboto+Mono:wght@400;700&family=Share+Tech+Mono&family=Source+Code+Pro:wght@400;700&family=Space+Mono:wght@400;700&display=swap';

export const metadata = {
  title: 'OTELLIA UI Design Lab',
  description:
    'OTELLIAのライト/ダーク両対応デザインシステム・入れ子脱却カード・4x4マトリクス・グループグラデーション・フォント検証基盤',
  icons: {
    icon: `${basePath}/favicon.ico`,
  },
};

const themeInitScript = `
(function() {
  try {
    var saved = window.localStorage.getItem('otellia-ui-color-scheme');
    var meta = document.querySelector('meta[name="color-scheme"]');
    var mode = (saved === 'light' || saved === 'dark') ? saved : 'light dark';
    if (meta) meta.setAttribute('content', mode);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = mode === 'dark' || (mode === 'light dark' && prefersDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={otelliaFont.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={UI_FONTS_HREF} />
        <link rel="stylesheet" href={MONO_FONTS_HREF} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
