'use client';

import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import {auth} from "@/src/lib/firebase";  // ここは既存のファイルから auth をエクスポートしている前提

export default function LoginPage(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // auth の状態を監視してログイン状態を反映
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged のコールバックで user がセットされるのでここで setUser する必要は基本的にない
    } catch (e: any) {
      console.error("Google sign-in error:", e);
      setError(e?.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (e: any) {
      console.error("Sign-out error:", e);
      setError(e?.message ?? "サインアウトに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">ログイン</h1>

        {user ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={user.photoURL ?? "/avatar-placeholder.png"}
              alt={user.displayName ?? "User avatar"}
              className="w-20 h-20 rounded-full shadow-sm object-cover"
            />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{user.displayName ?? "名無しユーザー"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="mt-4 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-colors disabled:opacity-60"
            >
              サインアウト
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-600 text-sm mb-2">Google アカウントで簡単にログインできます</p>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              aria-label="Sign in with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path fill="#4285f4" d="M533.5 278.4c0-18.6-1.5-37.4-4.7-55.2H272v104.5h146.9c-6.3 34-25.3 62.8-54 82.1v68.3h87.2c51-47 79.4-116.2 79.4-199.7z"/>
                <path fill="#34a853" d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-87.2-68.3c-24.2 16.2-55 25.8-93.5 25.8-71.8 0-132.8-48.5-154.6-113.9H29.5v71.6C74.4 485 166 544.3 272 544.3z"/>
                <path fill="#fbbc04" d="M117.4 324.7c-10.6-31.6-10.6-65.7 0-97.3V155.8H29.5c-41.6 81.6-41.6 178.9 0 260.5l87.9-91.6z"/>
                <path fill="#ea4335" d="M272 107.7c39.8-.6 77.8 14.2 106.8 40.7l80-80C405.4 24.6 343.5 0 272 0 166 0 74.4 59.3 29.5 155.8l87.9 71.6C139.2 156.2 200.2 107.7 272 107.7z"/>
              </svg>
              <span>Googleでサインイン</span>
            </button>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}