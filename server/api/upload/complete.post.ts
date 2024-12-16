export default defineEventHandler(async (event) => {
  const { path, title, to, message } = await readBody(event)

  const object = await hubBlob().head(path)

  const databaseResult = await saveToDatabase({
    name: object.pathname.split('/').pop() || 'Unknown',
    path: object.pathname,
    size: object.size,
  })

  const html = formatEmail(message, databaseResult.id)

  await sendEmail({
    to,
    subject: title,
    text: html,
  })

  return { success: true }
})