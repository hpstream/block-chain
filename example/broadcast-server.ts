import dgram, { Socket } from 'dgram';
const server = dgram.createSocket('udp4');
const multicastAddr = '224.100.100.100';
server.on('connect', (socket: Socket) => {
  var address = socket.address()
  console.log(address.address, address.port)
})
server.on('message', (data, remote) => {
  console.log('accept message', data.toString())
})

server.on('listening', () => {
  console.log('socket正在监听中...');
  // server.addMembership(multicastAddr); // 不写也行
  server.setBroadcast(true);
  server.setMulticastTTL(128);
  setInterval(() => {
    sendMsg();
  }, 1500);
});

function sendMsg() {
  // console.log('sending');
  server.send('1', 8061, '10.8.93.255');
  server.send('2', 8061, multicastAddr);
}

const port = 30000;
server.bind(port, () => {
  console.log(`listening is port: ${port}`)
})