export default defineTask({
  meta: {
    name: "file:purge",
    description: "Delete all the files that live in the system for more than 4 days",
  },
  async run({ payload, context }) {
    try {
      console.log('Starting file purge task...')

      // Récupérer toutes les clés avec le préfixe 'files:'
      const keys = await hubKV().getKeys('files:')
      console.log(`Total files found: ${keys.length}`)

      const now = Date.now()
      const fourDaysInMs = 4 * 24 * 60 * 60 * 1000

      for (const key of keys) {
        const fileRecord = await hubKV().getItem(key)

        if (!fileRecord) {
          console.log(`No data found for key: ${key}`)
          continue
        }

        const { id, path, createdAt } = fileRecord

        if (now - createdAt > fourDaysInMs) {
          console.log(`Purging file: ${id}, Path: ${path}, Created At: ${new Date(createdAt)}`)

          await hubBlob().del(path)

          console.log(`Deleted blob: ${path}`)
          await hubKV().del(key)
          console.log(`Deleted KV entry: ${key}`)
        } else {
          console.log(`File ${id} is not older than 4 days. Skipping...`)
        }
      }

      console.log('File purge task completed.')
      return { result: 'Purge completed successfully.' }
    } catch (error) {
      console.error('Error during file purge:', error)
      throw createError({ statusCode: 500, message: 'Purge task failed.' })
    }
  },
});