export default defineEventHandler(async (event) => {
  // Gère la logique d’upload multipart
  return hubBlob().handleMultipartUpload(event)
})
