
import { readFileSync, readdirSync } from "fs";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import path from "path";

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
  }

  public sendEmail(mailOptions: MailOptions) {
    return this.transporter.sendMail(mailOptions);
  }

  public enviarReandar(email: string, nombre: string) {
    console.log(`Enviando mail a ${email}...`)
    this.sendEmail(emailConReandarAdjunto(email, nombre));
  }
}

export const emailer = new Emailer();

console.log(`Cargando archivo...`)
console.log(`Buscando en ${process.cwd()}...`)
const libDirectory = path.resolve(process.cwd(), "src/app/lib")
const archivo = readFileSync( path.join(libDirectory, "reandar.pdf") )
console.log(`...archivo cargado!`)

export const emailConReandarAdjunto = (email: string, username: string) => {
  return {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `${username}, acá está tu copia de Reandar la huella - Caminos de investigación en el malabar`,
    text: "Muchas gracias por tu colaboración :)",
    attachments: [{
      filename: 'Reandar la huella - Caminos de investigación en el malabar.pdf',
      content: archivo 
    }]
  } as MailOptions;
}
