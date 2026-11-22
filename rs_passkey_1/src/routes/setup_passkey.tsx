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
async function post(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

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
      const elem_username = document.getElementById('user_name') as HTMLInputElement;
      console.log("elem_username=", elem_username.value);
      if(!elem_username.value){
        alert("ユーザーを、入力下さい。")
        return;
      }

      const resp  = await apiHandle('/api/login_start', 
        { username: elem_username.value }
      );
      console.log("#resp");
      console.log(resp);
      if(!resp.success){
        console.log("error, /api/login_start NG");
        alert("ログインに失敗しました。")
        return;
      }
      const challenge_id = resp.data.challenge_id;
      const options = resp.data.options;
      const pk = options.publicKey;
      pk.challenge = b64uToBuf(pk.challenge);
      (pk.allowCredentials || []).forEach((c) => (c.id = b64uToBuf(c.id)));
       
      const cred = await navigator.credentials.get({ publicKey: pk });
      const resp2 = await post("/api/login_finish", {
        challenge_id,
        credential: {
          id: cred.id,
          rawId: bufToB64u(cred.rawId),
          type: cred.type,
          response: {
            authenticatorData: bufToB64u(cred.response.authenticatorData),
            clientDataJSON: bufToB64u(cred.response.clientDataJSON),
            signature: bufToB64u(cred.response.signature),
            userHandle: cred.response.userHandle ? bufToB64u(cred.response.userHandle) : null,
          },
          extensions: cred.getClientExtensionResults(),
        },
      });      
      console.log("#resp2");
      console.log(resp2);
      if(resp2.success){
        LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, Number(value) , 30);
        location.href = "/"
      }
      return;
    }catch(e){console.log(e)}
    return;    
  };
  // base64url <-> ArrayBuffer
  const b64uToBuf = (s) => {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    s += "=".repeat((4 - (s.length % 4)) % 4);
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
  };
  const bufToB64u = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

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
      console.log("elem_username.len=", elem_username.value.length);
      if(!elem_username.value){
        alert("ユーザーを、入力下さい。")
        return;
      }

      const resp  = await apiHandle('/api/register_options', 
        { userId: Number(value) , username: elem_username.value}
      );
      console.log(resp);
      console.log("#data");
      console.log(resp.data);
      if(!resp.success){
        alert("error")
      }else{
        const challenge_id = resp.data.challenge_id;
        const options = resp.data.options;
//  const { challenge_id, options } = await post("/api/register/start", { username });
        const pk = options.publicKey;
        pk.challenge = b64uToBuf(pk.challenge);
        pk.user.id = b64uToBuf(pk.user.id);
        (pk.excludeCredentials || []).forEach((c) => (c.id = b64uToBuf(c.id)));
        // Windows Hello(プラットフォーム認証器)を優先
        pk.authenticatorSelection = { ...(pk.authenticatorSelection || {}), authenticatorAttachment: "platform" };
        console.log("#pk");
        console.log(pk);
        const cred = await navigator.credentials.create({ publicKey: pk });
        console.log("#cred");
        console.log(cred);
        const resp2 = await post("/api/register_finish", {
          challenge_id,
          credential: {
            id: cred.id,
            rawId: bufToB64u(cred.rawId),
            type: cred.type,
            response: {
              attestationObject: bufToB64u(cred.response.attestationObject),
              clientDataJSON: bufToB64u(cred.response.clientDataJSON),
            },
            extensions: cred.getClientExtensionResults(),
          },
        });
        console.log("#resp2");
        console.log(resp2);  
        if(!resp2.success){
          console.log("error , /api/register_finish");
          return;
        } 
        LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, value , 30);
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
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2"
        >パスキー認証</h1>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div className="text-left mb-2">
          <p className="text-neutral-500">* ユーザー名</p>
          <input id="user_name" placeholder="(例) yamada" 
          className="w-full p-2 border border-gray-300 rounded" /><br />
        </div>
        <div className="w-full my-4 max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2"
          >新規登録</h1>
          <button onClick={()=>{enable();}} 
          className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          >Passkeyを作成</button><br />
        </div>

        <hr className="my-2" />
        <div className="text-left mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">ログイン</h1>
          {/*
          <p className="text-neutral-500 text-sm"
          >Windows Helloが 保存済みパスキーを表示します </p>
          */}
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
    </div>
  );  
}
