import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Config from "../config"

export type PostType = {
  id: number
  title: string
  body: string
}

export const vecSearchPost = createServerFn({ method: 'POST' }).handler(async ({data}) => {
  console.info('Fetching createPost...')
  console.info(data)
  console.info(data.message)
  const sendDdata = {
    input: data.message
  };  
  try{
    const response = await fetch('http://localhost:8080/v1/embeddings', {
      method: 'POST', // リクエストメソッドを指定
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendDdata)
    });
    if (!response.ok) {
      throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    const result = await response.json();
    //console.log('成功:', result);
    let vec1 = [];
    if(result.data[0]){
      console.log("len=", result.data[0].embedding.length)
      vec1 = result.data[0].embedding;
    }
    const vSearch = {
      table: "document",
      limit: 1,
      vector: vec1
    }

    const res2 = await fetch(Config.EXTERNAL_API_URL + "/api/select", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vSearch)
    });
    if (!res2.ok) {
      throw new Error(`HTTPエラー! ステータス: ${res2.status}`);
    }
    const res3 = await res2.json();
    console.log(res3);
    return res3
  }catch(e){ console.log(e) }
});

/*
export const fetchPosts = createServerFn({ method: 'POST' }).handler(async () => {
  console.info('Fetching posts...')
  const sendDdata = {
    table: "todos",
    sql: `SELECT * FROM todos ORDER by id DESC LIMIT 100;`,
  };  
  try{
    const response = await fetch(Config.EXTERNAL_API_URL + "/api/select", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendDdata)
    });
    if (!response.ok) {
      throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    const result = await response.text();
    console.log('成功:', result);
    return result
  return posts;
  }catch(e){ console.log(e) }
})
*/

