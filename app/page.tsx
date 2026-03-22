'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/lib/firebase';
import { checkEnglishDiary } from './actions/ai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function DiaryPage() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [advice, setAdvice] = useState(''); // 添削結果を保存するステート
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ログイン状態を監視（これがないと auth.currentUser が null になることがあります）
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const saveDiary = async () => {
    if (!content || !currentUser) {
      alert('ログインしているか、文章が入っているか確認してください。');
      return;
    }
    setIsSaving(true);
    try {
      // 1. まず AI 添削を受ける
      const aiFeedback = await checkEnglishDiary(content);
      setAdvice(aiFeedback);

      // データベースに保存します
      await addDoc(collection(db, 'diaries'), {
        userId: currentUser.uid,
        text: content,
        advice: aiFeedback, // AIのフィードバックも保存
        createdAt: serverTimestamp(),
      });

      alert('日記を保存し、添削を完了しました！');
      setContent('');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('エラーが発生しました。詳細はコンソールを確認してください。');
    } finally {
      setIsSaving(false);
    }
  };

return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* ヘッダーセクション */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            English Diary <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-slate-500">日々の出来事を英語で綴り、AI教師から学びましょう。</p>
        </header>

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {!currentUser && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <p className="text-amber-700 text-sm">※ 記録を保存するにはログインが必要です。</p>
              </div>
            )}

            {/* 入力エリア */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">今日の日記</label>
              <textarea
                className="w-full h-48 p-4 text-lg border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 placeholder-slate-400 resize-none shadow-inner"
                placeholder="What happened today? (Write in English...)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <button
                onClick={saveDiary}
                disabled={isSaving || !currentUser || !content}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md flex items-center justify-center gap-2 ${
                  isSaving 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    AI Teacher is checking...
                  </>
                ) : '添削して保存する'}
              </button>
            </div>
          </div>
        </div>

        {/* 添削結果エリア */}
        {advice && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-blue-100 shadow-xl shadow-blue-50 rounded-2xl overflow-hidden">
              <div className="bg-blue-600 px-6 py-3">
                <h2 className="text-white font-bold flex items-center gap-2">
                  ✨ AI Teacher's Advice
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="prose prose-blue max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {advice}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}