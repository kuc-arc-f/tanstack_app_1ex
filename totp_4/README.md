# totp_4

 Version: 0.9.1

 Author  : 

 date    : 2026/11/02
 
 update  :

***
### Summary

TanStack Start , authrize 2FA TOTP example

* SQLite DB
* phone App :Google Authenticator use
* otplib
* node22
* Linux


***

* .env
```
# openssl rand -hex 32
TOTP_ENC_KEY=
# openssl rand -base64 48
SESSION_SECRET=
TOTP_ISSUER=DemoApp
PORT=3000
# NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
```

***
```
npm install
cp .env.example .env     # TOTP_ENC_KEY / SESSION_SECRET を設定
export $(grep -v '^#' .env | xargs)
npm run dev                # http://localhost:3000
```

***
### version
* V_0_9_1: new

***

