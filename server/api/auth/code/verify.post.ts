export default defineEventHandler(async (event) => {
  const { email, code } = await readBody(event)
  const storedCode = await hubKV().getItem(`authCode:${email}`)
  console.log(typeof storedCode, typeof code, code, storedCode)
  if (storedCode !== parseInt(code)) {
    throw createError({ statusCode: 401, message: 'Invalid Code' })
  }

  await setUserSession(event, {
    user: { email },
  })

  return { success: true, status: 200 }
})
