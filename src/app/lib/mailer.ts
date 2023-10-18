
import { readFileSync, readdirSync } from "fs";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import path from "path";
import tgbot from '@/app/lib/tg'

export class Emailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    this.transporter.verify(function (error, success) {
      if (error) {
          tgbot.sendMessage(process.env.TG_CHAT_ID!, `Error en transporter.verify: ${error}`)
          console.log(error);
      } else {
          tgbot.sendMessage(process.env.TG_CHAT_ID!, `transporter.verify exitoso: ${success}`)
          console.log("Server de mailing listo!");
      }
  });
  }

  public sendEmail(mailOptions: MailOptions) {
    return this.transporter.sendMail(mailOptions);
  }

  public enviarReandar(email: string, nombre: string) {
    console.log(`Enviando mail a ${email}...`)
    return this.sendEmail(emailConReandarAdjunto(email, nombre))
  }
}

export const emailer = new Emailer();

console.log(`Cargando archivos...`)
console.log(`Buscando en ${process.cwd()}...`)
const libDirectory = path.resolve(process.cwd(), "src/app/lib")
const reandar = readFileSync( path.join(libDirectory, "reandar.pdf") )
const vidriera = readFileSync( path.join(libDirectory, "vidriera.pdf") )
console.log(`...archivos cargados!`)

const emailConReandarAdjunto = (email: string, username: string) => {
  console.log(`Creando mail para ${username} (${email})`)
  return {
    from: `Sebastián Rojo<${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${username}, acá están tus copias de Reandar la huella y Vidriera mental`,
    text: `Hola. ¿Cómo estás?
Muchas gracias por la colaboración y el interés en el trabajo. Confío sea de provecho, nutritivo.
Eres libre de continuar el intercambio, o la comunicación según desees, respondiendo a este mail con cualquier pregunta, comentario o disparador que veas útil, ahora o más adelante.
Quedo receptivo.

Salud. Gracias
Sebastián Rojo`,
    attachments: [{
      filename: 'Reandar la huella - Caminos de investigación en el malabar - Sebastián Rojo.pdf',
      content: reandar
    },{
      filename: 'Vidriera mental - Una idea sobre malabarear - Sebastián Rojo.pdf',
      content: vidriera
    }]
  } as MailOptions;
}
