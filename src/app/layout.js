import localFont from 'next/font/local';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const otelliaFont = localFont({
  src: '../fonts/otellia.otf',
  variable: '--font-otellia',
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata = {
  title: 'OTELLIA UI Design Lab',
  description:
    'OTELLIAのライト/ダーク両対応デザインシステム・入れ子脱却カード・4x4マトリクス・グループグラデーション検証基盤',
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
    <html
      lang="ja"
      className={`${inter.variable} ${jetbrainsMono.variable} ${otelliaFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
