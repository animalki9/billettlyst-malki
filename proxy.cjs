// proxy.js
const cors_proxy = require('cors-anywhere')

const PORT = 8080

cors_proxy.createServer({
  originWhitelist: [], // Tillater alle domener
  requireHeader: [],
  removeHeaders: ['cookie', 'cookie2']
}).listen(PORT, () => {
  console.log(`CORS Anywhere proxy kjører på http://localhost:${PORT}`)
})
