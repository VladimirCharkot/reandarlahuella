
import { readFileSync } from "fs";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

export class Emailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
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
    this.sendEmail(emailConReandarAdjunto(email, nombre));
  }
}

export const emailer = new Emailer();

console.log(`Cargando archivo...`)
const archivo = readFileSync(process.env.PDF_LOCATION!)
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
