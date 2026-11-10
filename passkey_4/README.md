# passkey_4

 Version: 0.9.1

 Author  : 

 date    : 2026/11/10
 
 update  :

***
### Summary

TanStack Start + PostgreSQL, Passkey authrize 2FA Example

* Passkey
* windows11 , Windows hello
* PostgreSQL DB
* node22
* Linux

***
* Table: ./schema.sql

***

* .env
```
DATABASE_URL=postgres://root:admin@localhost:5432/mydb
PORT=3000
#NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
# WebAuthn (Passkey) 設定
# RP_ID はドメイン名のみ（ポート・スキームなし）。ローカル開発は localhost
RP_ID=localhost
RP_NAME=DemoApp
# ブラウザで開くURLと完全一致させる（スキーム + ホスト + ポート）
ORIGIN=http://localhost:3000
# true: この端末の認証器（Windows Hello / Touch ID など）のみ
# false: スマホ(QR)やセキュリティキーも許可
PLATFORM_ONLY=true

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

