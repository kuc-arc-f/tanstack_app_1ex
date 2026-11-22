import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import Config from "../config"

export type PostType = {
  id: number
  title: string
  body: string
}

export const loginPost = createServerFn({ method: 'POST' }).handler(async ({data}) => {
  console.info('Fetching loginPost...')
  console.info(data)
  try{
    const retObj = {ret:500 , message: ""}
    const response = await fetch(Config.EXTERNAL_API_URL + "/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('status:', response.status);
    retObj.ret = response.status;
    if (!response.ok) {
      return retObj;
    }
    setCookie(Config.COOKIE_KEY, '1')
    const result = await response.json();
    console.log('成功:', result);
    return retObj;
  }catch(e){ console.log(e) }
})

export const logoutFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  // Cookieを削除
  await setCookie(Config.COOKIE_AUTH_2_KEY, '', {
    maxAge: 0,
    path: '/',
  });
  await setCookie(Config.COOKIE_AUTH_1_KEY, '', {
    maxAge: 0,
    path: '/',
  });

  return {
    success: true,
  }
})
