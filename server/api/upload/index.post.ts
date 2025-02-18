export default defineEventHandler(async (event) => {
  console.log('Handling upload event...')
  const form = await readFormData(event)
  console.log('Form data read')

  const file = form.get('file') as File
  const title = form.get('title') as string
  const to = form.get('to') as string
  const message = form.get('message') as string

  console.log('Form fields:', { title, to, message, file })

  if (!title || !to || !message) {
    console.log('Missing required fields')
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  if (!file || !file.size) {
    console.log('No file provided')
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  console.log('Uploading file to blob storage...')
  const blobResult = await hubBlob().put(file.name, file, {
    addRandomSuffix: true,
  })
  console.log('File uploaded:', blobResult)

  console.log('Saving file data to database...')
  const databaseResult = await saveToDatabase({
    name: file.name,
    path: blobResult.pathname,
    size: blobResult.size,
  })
  console.log('File data saved to database:', databaseResult)

  const html = formatEmail(message, databaseResult.id)

  console.log('Sending email...')
  await sendEmail({
    to,
    subject: title,
    text: html,
  })
  console.log('Email sent')

  return { url: "https://sendy.nuxt.dev/downloads/" + databaseResult.id }
})
