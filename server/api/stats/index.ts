export default defineEventHandler(async (event) => {
  const keys = await hubKV().getKeys('files')

  const files: File[] = (await Promise.all(keys.map(async (key) => {
    const file = await hubKV().get(key)
    if (!file) return null
    return file
  }))).filter((file): file is File => file !== null)

  const size = files.reduce((acc, file) => acc + file.size, 0)

  return {
    files: keys.length,
    size,
  }
})
