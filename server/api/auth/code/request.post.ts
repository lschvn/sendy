export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  if (!email) {
    throw createError({ statusCode: 400, message: 'Missing Email' })
  }

  const oldKeys = await hubKV().get(`authCode:${email}`)
  if (oldKeys) {
    await hubKV().del(`authCode:${email}`)
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await sendEmail({
    to: email,
    subject: 'Login Code',
    text: `Your login code is: ${code}`,
  })

  await hubKV().set(`authCode:${email}`, code)
  return { success: true, status: 200 }
})
