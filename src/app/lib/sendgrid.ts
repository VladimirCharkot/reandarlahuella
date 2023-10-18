import sgMail from '@sendgrid/mail'
import { readFileSync } from 'fs'
import path from 'path'

sgMail.setApiKey(process.env.SENDGRID_KEY!)

const libDirectory = path.resolve(process.cwd(), "src/app/lib")
const reandar = readFileSync( path.join(libDirectory, "reandar.pdf") )
const vidriera = readFileSync( path.join(libDirectory, "vidriera.pdf") )

export const enviarReandarYVidriera = (mail: string, nombre: string) => {
  const msg = {
    to: mail,
    from: `Sebastián Rojo<${process.env.GMAIL_USER}>`,
    subject: `${nombre}, acá están tus copias de Reandar la huella y Vidriera mental`,
    text: `Hola. ¿Cómo estás?
Muchas gracias por la colaboración y el interés en el trabajo. Confío sea de provecho, nutritivo.
Eres libre de continuar el intercambio, o la comunicación según desees, respondiendo a este mail con cualquier pregunta, comentario o disparador que veas útil, ahora o más adelante.
Quedo receptivo.
  
Salud. Gracias
Sebastián Rojo`,
    attachments: [{
      content: reandar.toString('base64'),
      filename: 'Reandar la huella - Caminos de investigación en el malabar - Sebastián Rojo.pdf',
      type: 'pdf'
    },{
      content: vidriera.toString('base64'),
      filename: 'Vidriera mental - Una idea sobre malabarear - Sebastián Rojo.pdf',
      type: 'pdf'
    }
  ]
  }
  return sgMail.send(msg)
}
