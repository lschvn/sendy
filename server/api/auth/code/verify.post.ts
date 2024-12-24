export default defineEventHandler(async (event) => {
  const { email, code } = await readBody(event)
  const storedCode = await hubKV().getItem(`auth:${email}`)
  if (storedCode !== parseInt(code)) {
    throw createError({ statusCode: 401, message: 'Invalid Code' })
  }

  await setUserSession(event, {
    user: { email },
  })

  return { success: true, status: 200 }
})
