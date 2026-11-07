# totp_7

 Version: 0.9.1

 Author  : 

 date    : 2026/11/07
 
 update  :

***
### Summary

TanStack Start , authrize 2FA TOTP PostgreSQL

* PostgreSQL DB
* phone App :Google Authenticator use
* otplib
* node22
* Linux


***
* Table: schema.sql

***

* .env
```
DATABASE_URL=postgres://root:admin@localhost:5432/mydb
SESSION_SECRET=ここに長いランダム文字列
# 32バイト(hex 64文字): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOTP_ENC_KEY=
TOTP_ISSUER=DemoApp
PORT=3000
# NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
```

***
* node start
```
npm install
npm run dev
```

***
### version
* V_0_9_1: new

***
### blog

https://zenn.dev/knaka0209/scraps/82e4dc3d3f0a76

