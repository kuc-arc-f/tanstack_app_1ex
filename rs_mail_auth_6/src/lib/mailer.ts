import nodemailer from 'nodemailer';

const configured = Boolean(process.env.SMTP_HOST);

if (!configured && process.env.NODE_ENV === 'production') {
  throw new Error('本番環境では SMTP_HOST などの SMTP 設定が必須です');
}

const port = Number(process.env.SMTP_PORT || 587);

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 は SSL、587 は STARTTLS
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

const Mailer = {
  sendOtpMail: async function (to, code, ttlMinutes) {
    // 開発用: SMTP 未設定ならコンソールに出力
    if (!transporter) {
      console.log(`\n[DEV] ${to} 宛ての認証コード: ${code}（${ttlMinutes}分有効）\n`);
      return;
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: `認証コード: ${code}`,
      text:
        `ログイン用の認証コードは次のとおりです。\n\n` +
        `${code}\n\n` +
        `このコードは${ttlMinutes}分間有効です。\n` +
        `心当たりがない場合は、このメールを破棄してください。`,
      html:
        `<p>ログイン用の認証コードは次のとおりです。</p>` +
        `<p style="font-size:28px;font-weight:bold;letter-spacing:6px;font-family:monospace">${code}</p>` +
        `<p>このコードは${ttlMinutes}分間有効です。<br>心当たりがない場合は、このメールを破棄してください。</p>`,
    });
  },
}
export default Mailer;
