import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import React, { useState , useEffect } from 'react';
import { User, Mail, Lock } from "lucide-react";
import { fetchPosts, signupPost , deletePost } from '../utils/signup'

export const Route = createFileRoute('/signup')({
  component: PostsComponent,
})

function PostsComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const apiHandle = async function(path, body){
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const status = r.status;
    console.log("status=", status)
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'エラー');
    return data;    
  }
  const say = (m) => { $('msg').textContent = m || ''; };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // 登録処理のモック
    console.log("Registered user data:", formData);
    try{
      const resp  = await apiHandle('/api/register', 
        { username: formData.email , password: formData.password }
      );
      console.log(resp);
      if(!resp.success){
        alert("error")
      }else{
        location.href = "/login";
        //alert("OK")
        //say('登録しました。ログインしてください。');
      }
      /*
      if(resp.ret >= 200 && resp.ret <= 209){ location.href = "/login"; }
      else{
        if(resp.ret >= 400 && resp.ret <= 409){ alert("Error , email or password") }
        else{  alert("Error , Internal Server Error")}
      }
      */
    }catch(e){console.log(e)}
    return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Signup
          </h1>
          <p className="mt-2 text-sm text-slate-500 text-center">
            必要な情報を入力して、<br />新しいアカウントを作成してください
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-lg font-medium text-slate-900 mb-2">登録完了</h2>
            <p className="text-sm text-slate-500 mb-6">
              {formData.name} 様、ご登録ありがとうございます。
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: "", email: "", password: "" });
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5 flex flex-col">
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
              >
                登録する
              </button>
            </div>
          </form>
        )}
      </div>
      
      <p className="mt-8 text-xs text-slate-400">
        © 2026 Your Company. All rights reserved.
      </p>
    </div>
  );
}
