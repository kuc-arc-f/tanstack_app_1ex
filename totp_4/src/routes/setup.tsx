import { createFileRoute } from '@tanstack/react-router'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import LibAuth from '../lib/LibAuth'
import Config from '../config'

export const Route = createFileRoute('/setup')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [auth2Disp, setAuth2Disp] = useState('');

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
    try{
      const value = LibAuth.getCookieValue(Config.COOKIE_AUTH_1_KEY)
      console.log('value=', value);
      if(!value){ 
        console.log("Cookie not found, redirecting to /login");
        return;
      }
      const resp  = await apiHandle('/api/setup', 
        { userId: Number(value) }
      );
      console.log(resp);
      if(!resp.success){
        alert("error")
      }else{
        setImgSrc(resp.data.qrDataUrl);
      }      
    }catch(e){console.log(e)}
    return;    
  };

  const enable = async() => {
    console.log("#enable");
    try{
      const value = LibAuth.getCookieValue(Config.COOKIE_AUTH_1_KEY)
      console.log('value=', value);
      if(!value){ 
        console.log("Cookie not found, redirecting to /login");
        return;
      }      
      //code_6
      const element = document.getElementById('code_6') as HTMLInputElement;
      console.log("code_6=", element.value);
      const resp  = await apiHandle('/api/enable', 
        { userId: Number(value) , token: element.value}
      );
      console.log(resp);
      if(!resp.success){
        alert("error")
      }else{
        LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, Number(value) , 30);
        //alert("OK")
        location.href = "/";
      }         
    }catch(e){  console.log(e)}

  }

  const logout = async() => {
    console.log("#logout");
    try{
      LibAuth.logout();
    }catch(e){  console.log(e)}

  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">2段階認証</h1>
          <p className="text-neutral-500 text-sm"></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ログインボタン */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors mt-2"
          >
            2段階認証を有効にする
          </button>
        </form>
        {imgSrc ? (
          <div id="setupArea" >
            <p className="py-2">認証アプリで QR を読み取り、表示された 6 桁コードを入力してください。</p>
            <hr />
            <img src={imgSrc} alt="QR" />

            <p>手入力キー: <code id="mk"></code></p>
            <input id="code_6" inputmode="numeric" maxlength="6" placeholder="6 桁コード" 
            className="p-2 border border-gray-300 rounded" /><br />
            <button onClick={()=>{enable();}} 
            className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            >有効化</button>
            < hr />
            <button onClick={()=>{ logout();}} 
            className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            >ログアウト</button>
          </div>
        ) : (<></>)}        

        <div className="mt-8 text-center text-sm text-neutral-500">
        </div>
      </div>
    </div>
  );  
}
