import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Config from "../config"

export type PostType = {
  id: number
  title: string
  body: string
}

export const signupPost = createServerFn({ method: 'POST' }).handler(async ({data}) => {
  console.info('Fetching signupPost...')
  console.info(data)
  try{
    const retObj = {ret:500 , message: ""}
    const response = await fetch(Config.EXTERNAL_API_URL + "/signup", {
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
      //throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    const result = await response.json();
    console.log('成功:', result);
    return retObj;
  }catch(e){ console.log(e) }
})
