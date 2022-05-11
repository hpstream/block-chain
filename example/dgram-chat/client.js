const {
  Socket
} = require('./lib/index')

let client = new Socket();


client.connect(3000)

client.on('connect', () => {
  console.log('已连接到服务器\n\r')
  client.write(`已连接到服务器\n\r`);
  // client.write(JSON.stringify({
  //   cmd: 'login',
  //   msg: 'hello server',
  //   nick: nick
  // }));
});