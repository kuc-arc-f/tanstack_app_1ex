# totp_5

 Version: 0.9.1

 Author  : 

 date    : 2026/11/04
 
 update  :

***
### Summary

TanStack Start , authrize TOTP Mail example

* SQLite DB
* mail auth
* node22
* Linux


***

* .env
```
# .env にコピーして使用してください
PORT=3000
NODE_ENV=development
DB_PATH=app.db

# --- SMTP ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="MyApp <no-reply@example.com>"

# --- OTP / セッション設定 ---
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=60
SESSION_TTL_DAYS=7

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

