import { createFileRoute } from '@tanstack/react-router'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
//import { fetchPosts, loginPost , deletePost } from '../utils/login'
import LibAuth from '../lib/LibAuth'
import Config from '../config'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const apiHandle = async function(path, body){
    console.log("#apiHandle")
    console.log(body)
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'エラー');
    return data;    
  }
  const say = (m) => { $('msg').textContent = m || ''; };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // 実際のログイン処理はここに実装します
    console.log('ログイン試行:', { email, password });
    try{
      const resp  = await apiHandle('/api/login', 
        { username: email , password: password }
      );
      console.log(resp);
      if(!resp.success){
        alert("error")
      }else{
        const res2  = await apiHandle('/api/user_get_id', 
          { username: email}
        );
        console.log(res2);
        if(res2.success){
          const userId = res2.data.id;
          console.log("userId=", userId)
          LibAuth.setCookie(Config.COOKIE_AUTH_1_KEY, userId , 30);
          location.href = "/setup";
        }
      }      
      /*
      if(resp.ret >= 200 && resp.ret <= 209){ location.href = "/"; }
      else{
        if(resp.ret >= 400 && resp.ret <= 409){ alert("Error , email or password") }
        else{  alert("Error , Internal Server Error")}
      }
      */
    }catch(e){console.log(e)}
    return;    
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Login</h1>
          <p className="text-neutral-500 text-sm">アカウントにログインしてください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* メールアドレス入力 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700" htmlFor="email">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm transition-colors outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* パスワード入力 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700" htmlFor="password">
                パスワード
              </label>
              <a href="#" className="text-sm font-medium text-neutral-900 hover:underline">
                お忘れですか？
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm transition-colors outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors mt-2"
          >
            <LogIn className="h-4 w-4 mr-2" />
            ログイン
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          アカウントをお持ちでないですか？{' '}
          <a href="/signup" className="font-medium text-neutral-900 hover:underline">
            新規登録
          </a>
        </div>
      </div>
    </div>
  );
}
