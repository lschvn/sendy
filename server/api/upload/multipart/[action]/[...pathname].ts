export default defineEventHandler(async (event) => {
  try {
    const result = await hubBlob().handleMultipartUpload(event)

    // Vérifier si l'action est 'complete'
    const { action } = getRouterParams(event)
    if (action === 'complete') {
      const body = await readBody(event)
      const { pathname } = body
      const metadata = body.metadata || {}

      const object = await hubBlob().head(pathname)

      const databaseResult = await saveToDatabase({
        name: object.pathname.split('/').pop() || 'Unknown',
        path: object.pathname,
        size: object.size,
      })

      const html = formatEmail(metadata.message, databaseResult.id)

      await sendEmail({
        to: metadata.to,
        subject: metadata.title,
        text: html,
      })
    }

    return result
  } catch (error) {
    console.error('Error during multipart upload:', error)
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})