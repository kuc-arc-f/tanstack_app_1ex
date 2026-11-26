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
// ---------- base64url <-> ArrayBuffer ----------
const toBuf = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
};
const toB64u = (buf) => {
  let bin = '';
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
// ---------- base64url <-> ArrayBuffer ----------
function b64urlToBuffer(str) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
function bufferToB64url(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imgSrc, setImgSrc] = useState('a');
  const [auth2Disp, setAuth2Disp] = useState('');
  const [errMsg, setErrMsg] = useState("");

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
      setErrMsg("")
      const value = LibAuth.getCookieValue(Config.COOKIE_AUTH_1_KEY)
      console.log('value=', value);
      if(!value){ 
        console.log("Cookie not found, redirecting to /login");
        return;
      }
      const elem_username = document.getElementById('user_name') as HTMLInputElement;
      console.log("elem_username=", elem_username.value);
      if(!elem_username.value){
        alert("ユーザー名を、入力下さい。")
        return;
      }

      const resp  = await apiHandle('/api/login_start', 
        { username: elem_username.value }
      );
      console.log("#resp");
      console.log(resp)
      if(resp.success === false){
        setErrMsg(resp.message)
        console.log("error, resp=NG");
        return;
      };
      const startData = resp.data 
      const challenge_id = startData.challenge_id;
      const options = startData.options;
      console.log("#options");
      console.log(options)

      const pk = options.publicKey;
      pk.challenge = b64urlToBuffer(pk.challenge);
      if (pk.allowCredentials) {
        pk.allowCredentials = pk.allowCredentials.map((c) => ({ ...c, id: b64urlToBuffer(c.id) }));
      }
      const cred = await navigator.credentials.get({ publicKey: pk });
      console.log("#cred");
      console.log(cred)
      const resp2 = await apiHandle("/api/login_finish", {
        challenge_id,
        credential: {
          id: cred.id,
          rawId: bufferToB64url(cred.rawId),
          type: cred.type,
          response: {
            authenticatorData: bufferToB64url(cred.response.authenticatorData),
            clientDataJSON: bufferToB64url(cred.response.clientDataJSON),
            signature: bufferToB64url(cred.response.signature),
            userHandle: cred.response.userHandle ? bufferToB64url(cred.response.userHandle) : null,
          },
          extensions: cred.getClientExtensionResults?.() ?? {},
        },
      });
      console.log("#resp2");
      console.log(resp2)
      if(resp2.success === false){
        console.log("error, resp2=NG");
        return;
      };    
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
      setErrMsg("")
      const value = LibAuth.getCookieValue(Config.COOKIE_AUTH_1_KEY)
      console.log('value=', value);
      if(!value){ 
        console.log("Cookie not found, redirecting to /login");
        return;
      }
      const elem_username = document.getElementById('user_name') as HTMLInputElement;
      console.log("elem_username=", elem_username.value);
      if(!elem_username.value){
        alert("ユーザー名を、入力下さい。")
        return;
      }      
      const resp  = await apiHandle('/api/register_start', 
        { 
          userId: Number(value) , username: elem_username.value,
          display_name: elem_username.value
        }
      );
      console.log(resp);
      if(!resp.success){
        setErrMsg(resp.message)
        alert("error")
      }else{
        const optionsJSON = resp.data;
        console.log("#optionsJSON")
        console.log(optionsJSON)
        const challenge_id = optionsJSON.challenge_id;
        const options = optionsJSON.options;
        console.log("#options")
        console.log(options)

        const pk = options.publicKey;
        pk.challenge = b64urlToBuffer(pk.challenge);
        pk.user.id = b64urlToBuffer(pk.user.id);
        if (pk.excludeCredentials) {
          pk.excludeCredentials = pk.excludeCredentials.map((c) => ({ ...c, id: b64urlToBuffer(c.id) }));
        }
        const cred = await navigator.credentials.create({ publicKey: pk });
        console.log("#cred")
        console.log(cred)

        const res2 = await apiHandle("/api/register_finish", {
          challenge_id,
          credential: {
            id: cred.id,
            rawId: bufferToB64url(cred.rawId),
            type: cred.type,
            response: {
              attestationObject: bufferToB64url(cred.response.attestationObject),
              clientDataJSON: bufferToB64url(cred.response.clientDataJSON),
              transports: cred.response.getTransports?.() ?? null,
            },
            extensions: cred.getClientExtensionResults?.() ?? {},
          },
        });
        //setStatus(`登録完了：${user.display_name} としてログインしました`, "ok");
        console.log("#res2")
        console.log(res2)
        if(res2.success === true){
          LibAuth.setCookie(Config.COOKIE_AUTH_2_KEY, Number(value) , 30);
          location.href = "/"
        }
        //alert("OK")
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
      <div className="w-full my-2 max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <p className="text-neutral-500">* ユーザー名</p>
        <input id="user_name" placeholder="(例) yamada" 
        className="w-full p-2 border border-gray-300 rounded" /><br />
        <hr />
        {/* error-text */}
        <div>  
          {(errMsg !=="") ? (<div className="text-red-600">
            {errMsg}
          </div>
          ):(<></>)}
        </div>        
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div className="text-left mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">ログイン</h1>
          <p className="text-neutral-500 text-sm"
          >(Windows Helloが 保存済みパスキーを表示します) </p>
          {/*
          <input id="user_name_login" placeholder="ユーザー名(任意)" 
          className="w-full my-2 p-2 border border-gray-300 rounded" /><br />          
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
      <div className="w-full my-4 max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2"
        >新規登録</h1>
        <hr />
        
        <button onClick={()=>{enable();}} 
        className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
        >Passkeyを作成</button><br />
        < hr />
      </div>
    </div>
  );  
}
