'use server';

export async function checkEnglishDiary(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "APIキーが設定されていません。";

  // 【解決の鍵】住所を v1beta に、モデル名を gemini-2.5-flash に固定
  // v1 で 404 が出る場合は、この v1beta が唯一の回避策です
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `以下の英語日記を添削して、修正文と日本語の解説を返してください：\n${text}` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // ここで出るエラーメッセージが「本当の原因」を教えてくれます
      return `APIエラー (${response.status}): ${data.error?.message || "通信失敗"}`;
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error: any) {
    return "接続エラーが発生しました。しばらく時間を置いてからお試しください。";
  }
}