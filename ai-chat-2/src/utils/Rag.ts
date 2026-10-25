const Rag = {

  // fetchによるPOST送信
  sendPostRequest: async function (query) {
    let ret = [];
    const data = {
      input: query
    };
    try {
      const response = await fetch('http://localhost:8080/v1/embeddings', {
        method: 'POST', // リクエストメソッドを指定
        headers: {
          'Content-Type': 'application/json' // JSONを送ることを伝える
        },
        body: JSON.stringify(data) // データをJSON文字列に変換
      });

      // レスポンスのステータスコードを確認
      if (!response.ok) {
        throw new Error(`HTTPエラー! ステータス: ${response.status}`);
      }

      // 返ってきたJSONデータを解析
      const result = await response.json();
      //console.log('成功:', result);
      if(result.data[0]){
        console.log("len=", result.data[0].embedding.length)
      }
      return result.data[0].embedding;
    } catch (error) {
      console.error('エラーが発生しました:', error);
    }
    return ret;
  },

  rag_search: async (query) => {
    try{
      const resp = await this.sendPostRequest(query);
      console.log("len=", resp.length)
    }catch(e){ console.log(e) }
  },
}
export default Rag;
