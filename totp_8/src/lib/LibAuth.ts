import Config from "../config"
import { logoutFn } from '../utils/login'

const LibAuth = {
  logout: async function(){
    console.log("#logout")
    const res2 = await logoutFn()
    location.href = "/login";
  } ,  

  getCookieValue: function (key) {
    const cookies = document.cookie.split('; ');
    console.log(cookies);
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === key) {
            return decodeURIComponent(value);
        }
    }
    return null;
  },

  isValidLogin: function () {
    const value = this.getCookieValue(Config.COOKIE_AUTH_2_KEY)
    console.log("value=", value);
    if(!value){
      location.href = "/login";
    }
  },

  /**
   * Cookieを保存する関数
   * @param {string} name - キー（名前）
   * @param {string} value - 保存する値
   * @param {number} days - 有効期限（日数）
   */
  setCookie: function (name, value, days) {
      let expires = "";
      if (days) {
          const date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
      }
      // encodeURIComponentで特殊文字や日本語のエラーを防ぐ
      document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
  },

  deleteCookie: function (name) {
    // 有効期限を過去（1970年1月1日）に設定して上書きし、即座に失効させる
    document.cookie = name + '=; max-age=0; path=/';
  },
}
export default LibAuth;
