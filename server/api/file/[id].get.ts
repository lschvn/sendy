export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event)

    const file = await hubKV().getItem(`files:${id}`)

    if(!file) {
        throw createError({ statusCode: 404, message: 'File not found' })
    }

    return file
})