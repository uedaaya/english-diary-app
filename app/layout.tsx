import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My English Diary",
  description: "AIが添削してくれる英語日記アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ここに書いたものが全ページ共通の見た目になります */}
        {children}
      </body>
    </html>
  );
}