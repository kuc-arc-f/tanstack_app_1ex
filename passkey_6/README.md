# passkey_6

 Version: 0.9.1

 Author  : 

 date    : 2026/11/12
 
 update  :

***
### Summary

TanStack Start , 2FA Passkey + mail auth Example

* windows11 , Windows hello
* SQLite DB
* node22
* Linux

***

* .env
```
TOTP_ISSUER=DemoApp
PORT=3000
# NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
NODE_ENV=development
DB_PATH=./app.db

# --- SMTP ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-pass
MAIL_FROM="MyApp <no-reply@example.com>"

# --- OTP / セッション設定 ---
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=60
SESSION_TTL_DAYS=7
```


***
```
npm install
npm run dev                # http://localhost:3000
```

***
### version
* V_0_9_1: new

***
### blog

https://zenn.dev/link/comments/daf2f263bc3f41

