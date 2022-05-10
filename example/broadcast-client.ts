import dgram, { Socket } from 'dgram';
const client = dgram.createSocket('udp4');
const port = 30000;
const multicastAddr = '224.100.100.100';
client.on('listening', () => {
  console.log('socket正在监听中...');
  client.addMembership(multicastAddr);
});
client.on('message', (msg, rinfo) => {
  console.log(`receive server message from ${rinfo.address}:${rinfo.port}：${msg}`);
});
client.on('close', () => {
  console.log('socket已关闭');
});

client.on('error', (err) => {
  console.log(err);
});

const message = Buffer.from('Some bytes');
client.bind(8062);
// client.connect(port, 'localhost', () => {
//   client.send(message, (err) => {
//     // client.close();
//   });
// });