import { createFileRoute } from '@tanstack/react-router'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import React, { useState , useEffect } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import LibAuth from '../lib/LibAuth'
import Config from '../config'

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser'

export const Route = createFileRoute('/setup_passkey')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imgSrc, setImgSrc] = useState('a');
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
    if (!r.ok) {
      console.log(data)
      throw new Error(data.error || 'エラー');
    }
    return data;    
  }
  const say = (m) => { $('msg').textContent = m || ''; };

  useEffect(() => {
    (async() => {
      try{
        const value = LibAuth.getCookieValue(Config.COOKIE_AUTH_1_KEY)
        console.log('value=', value);
        if(!value){
          location.href = "/"
          return;
        }
        /*
        const resp  = await apiHandle('/api/user_get_name', 
          { userId: Number(value) }
        );
        console.log(resp);
        if(!resp.success){
          alert("error")
        }else{
          setUsername(resp.data.username);
        }         
        */
      }catch(e){console.log(e)}
    })();   
  }, []);

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
      const resp  = await apiHandle('/api/login_options', 
        { userId: Number(value) }
      );
      console.log("#resp");
      console.log(resp);
      let optionsJSON = resp.data
      const asr = await startAuthentication({ optionsJSON });
      console.log("#asr");
      asr.userId = Number(value);
      console.log(asr);
      const resp2 = await apiHandle('/api/login_verify', asr);
      console.log(resp2);
      if(resp2.success){
        LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, Number(value) , 30);
        location.href = "/"
      }
      return;
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
      const elem_username = document.getElementById('user_name') as HTMLInputElement;
      console.log("elem_username=", elem_username.value);

      const resp  = await apiHandle('/api/register_options', 
        { userId: Number(value) , username: elem_username.value}
      );
      console.log(resp);
      if(!resp.success){
        alert("error")
      }else{
        const optionsJSON = resp.data;
        const att = await startRegistration({ optionsJSON }); // ← Windows Hello のダイアログが出る
        console.log(att)
        att.userId = Number(value);
        const resp2 = await apiHandle('/api/register_verify', att);
        console.log(resp2)
        LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, Number(value) , 30);
        //alert("OK")
        //location.href = "/";
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
        <div className="text-left mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">ログイン</h1>
          <p className="text-neutral-500 text-sm"
          >ユーザー名は空欄でもOK<br />(Windows Helloが 保存済みパスキーを表示します) </p>
          <input id="user_name_login" placeholder="ユーザー名(任意)" 
          className="w-full my-2 p-2 border border-gray-300 rounded" /><br />          
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ログインボタン */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors mt-2"
          >
            Windows Hello でログイン
          </button>
        </form>
      </div>
      <div className="w-full my-4 max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2"
        >新規登録</h1>
        <p className="text-neutral-500">* ユーザー名</p>
        <input id="user_name" placeholder="(例) yamada" 
        className="w-full p-2 border border-gray-300 rounded" /><br />
        <button onClick={()=>{enable();}} 
        className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
        >Passkeyを作成</button><br />
        < hr />
      </div>
    </div>
  );  
}
