export default eventHandler(async (event) => {
  const { path } = getRouterParams(event)

  setHeader(event, 'Content-Security-Policy', 'default-src \'none\';')
  return hubBlob().serve(event, path)
})
