import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Config from "../config"

export type PostType = {
  id: number
  title: string
  body: string
}

export const fetchPosts = createServerFn().handler(async () => {
  console.info('Fetching posts...')
  const res = await fetch(Config.EXTERNAL_API_URL + '/api/todos')
  if (!res.ok) {
    throw new Error('Failed to fetch todos')
  }

  const posts = await res.json()
  //console.log(posts)
  return posts;
})

export const createPost = createServerFn({ method: 'POST' }).handler(async ({data}) => {
  console.info('Fetching createPost...')
  console.info(data)
  try{
    const response = await fetch(Config.EXTERNAL_API_URL + "/api/todos", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    const result = await response.json();
    console.log('成功:', result);
  }catch(e){ console.log(e) }
})

export const deletePost = createServerFn({ method: 'POST' }).handler(async ({data}) => {
  console.info('Fetching deletePost...')
  console.info(data)
  try{
    if(!data.id) {
      console.log("error, id none")
      return
    }
    const response = await fetch(Config.EXTERNAL_API_URL + "/api/todos/" + data.id, {
      method: 'DELETE',
      //body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    const result = await response.json();
    console.log('成功:', result);
  }catch(e){ console.log(e) }
})