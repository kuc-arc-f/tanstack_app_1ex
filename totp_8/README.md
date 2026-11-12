# totp_8

 Version: 0.9.1

 Author  : 

 date    : 2026/11/04
 
 update  :

***
### Summary

TanStack Start , Authrize TOTP Mail PostgreSQL , example

* PostgreSQL DB
* mail auth
* node22
* Linux


***

* .env
```
# NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
DATABASE_URL=postgres://root:admin@localhost:5432/mydb
SESSION_SECRET=長い文字を設定
# 32バイト(hex 64文字): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOTP_ENC_KEY=8f1b3b606592cad3b1173d76869b3c507e2e18534ca0a251cf72b411c085817e
TOTP_ISSUER=DemoApp
PORT=3000
# SMTP (例: Gmail の場合はアプリパスワードを使用)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-pass
MAIL_FROM="My App <your@gmail.com>"
# OTP 設定
OTP_EXPIRE_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=60

```

***
* start
```
npm install
npm run dev                # http://localhost:3000
```

***
### version
* V_0_9_1: new

***

