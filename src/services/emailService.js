// src/services/emailService.js
import nodemailer from "nodemailer";

/**
 * Envia e-mail de confirmação de aposta
 */
export async function enviarEmailApostador({ nome, email, txid, valor }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const message = {
    from: '"Mega7 da Sorte" <mega7dasorte@gmail.com>',
    to: email,
    subject: "Confirmação de Aposta",
    text: `Olá ${nome}, sua aposta foi registrada com sucesso!\nTXID: ${txid}\nValor: R$${Number(valor).toFixed(2)}`
  };

  await transporter.sendMail(message);
}