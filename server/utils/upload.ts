import { randomUUID } from 'crypto'

export async function sendEmail(options: {
  to: string
  subject: string
  text: string
}) {
  const config = useRuntimeConfig()
  const { to, subject, text } = options
  const res = await $fetch('https://send.lschvn.dev/api/mail', {
    method: 'POST',
    body: {
      to, subject, html: text, from: 'sendy@lschvn.dev', auth_key: config.mail_auth_key,
    },
  })
  console.log(res)
  return res
}

export async function saveToDatabase(fileData: {
  name: string
  path: string
  size: number
}) {
  const id = randomUUID()
  const fileRecord = {
    id,
    ...fileData,
    createdAt: Date.now(),
  }

  await hubKV().setItem(`files:${id}`, fileRecord)
  return fileRecord
}

export function formatEmail(message: string, id: string) {
  return `${message} - https://sendy.nuxt.dev/downloads/${id}`
}
