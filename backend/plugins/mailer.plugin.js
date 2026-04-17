import fp from "fastify-plugin";
import MailService from "../services/mailService.js";
import { createTransport } from "nodemailer";


const mailerPlugin = fp(async (fastify) => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    defaults: {
      from: process.env.MAIL_FROM,
    },
  });

  fastify.decorate("mailservice", (new MailService(transporter, "RowMart")));
})

export default mailerPlugin;