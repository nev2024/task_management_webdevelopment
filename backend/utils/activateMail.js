const nodemailer = require("nodemailer");


const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

const activateMailAccount = async (to, url, text) => {
  try {
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ADMIN_EMAIL,
        pass: ADMIN_PASS
      }
    });

    const mailOptions = {
      from: `"Sistemi i Menaxhimit" <${ADMIN_EMAIL}>`,
      to: to,
      subject: "✅ Verifiko emailin - Sistemi i Menaxhimit",
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Account Activation</title>
        </head>
        <body style="font-family: Verdana; background-color: #f4f4f4; color: #333; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
            <h2 style="color: #0184ff;">Aktivizo llogarine</h2>
            <p>Mirë se vini në Sistemin e Menaxhimit! Faleminderit që u regjistruat.</p>
            <p>Klikoni butonin më poshtë për të verifikuar adresën tuaj të email-it dhe për të përfunduar procesin e regjistrimit.</p>
            <a href="${url}" target="_blank" style="display: inline-block; background-color: #0184ff; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; margin-top: 10px;">
              ${text}
            </a>
            <p style="margin-top: 20px;">Nëse butoni nuk funksionon, kopjoni dhe ngjisni këtë lidhje në browserin tuaj:</p>
            <div style="word-break: break-all; color: #555;">${url}</div>
            <p style="margin-top: 30px;">This link will expire in 15 minutes.</p>
          </div>
        </body>
        </html>`
    };

    const info = await smtpTransport.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return { error: err.message };
  }
};

module.exports = { activateMailAccount };