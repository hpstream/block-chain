const {
  createServer
} = require('./lib/index')

let server = new createServer();

server.on('connect', (socket) => {
  // console.log('连接上了服务器')
  console.log('socket', socket)
})

server.on('data', (socket) => {
  // console.log('连接上了服务器')
  console.log('socket', socket)
})


let port = 3000
server.listen(port, () => {
  console.log(`listening is port: ${port}`)
})