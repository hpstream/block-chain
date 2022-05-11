let dgram = require('dgram');
const EventEmitter = require('events');


class Socket extends EventEmitter {
  constructor() {
    super()
  }
  connect(port, serverAddress = '127.0.0.1') {
    this.client = dgram.createSocket('udp4');
    this.client.bind(0, (...args) => {
      let address = this.client.address();
      this.serverAddress = serverAddress;
      this.serverPort = port;
      this.clientAddress = address.address;
      this.clientPort = address.port;
      this.send({
        type: 'connection',
        data: {
          ...address
        }
      })
      this.client.on('message', (data, remove) => {
        this.dispatch(JSON.parse(data), remove);
      })
    })

    this.client.on('error', (error) => {
      console.log(error)
    })

  }

  dispatch(data, remove) {
    switch (data.type) {
      case 'connect':
        this.emit('connect', data.data)
        break;
      case 'data':
        this.emit('data', data.data)
        break;

      default:
        break;
    }
  }

  write() {

  }
  send(msg) {
    // console.log(JSON.stringify(msg), this.serverPort, this.serverAddress)
    this.client.send(JSON.stringify(msg), this.serverPort, this.serverAddress)
  }
}

class serverSocket {
  constructor(client) {
    // console.log(client)
    this.address = client.address;
    this.port = client.port;

  }
  // write

  send(msg) {
    this.send(JSON.stringify(msg), this.address, this.port)
  }
}
class createServer extends EventEmitter {
  constructor() {
    super()
  }
  dispatch(data, remove) {
    switch (data.type) {
      case 'connection':
        this.emit('connect', new serverSocket(data.data, remove))
        // console.log(remove.address, remove.port)
        this.send(JSON.stringify({
          type: 'connect',
          data: ''
        }), remove.port, remove.address)
        break;
      case 'data':
        this.emit('data', data.data)
        break;

      default:
        break;
    }

  }
  send(msg, port, address) {
    // console.log(msg, port, address)
    this.server.send(msg, port, address)
  }

  listen(port, cb) {
    this.server = dgram.createSocket('udp4');
    this.server.bind(port, (...args) => {
      let address = this.server.address();
      this.address = address.address;
      this.port = address.port;
      this.server.on('message', (data, remove) => {
        // console.log(JSON.parse(data))
        this.dispatch(JSON.parse(data), remove);
      })
      this.server.on('error', (error) => {
        console.log(error)
      })
      cb && cb(...args)
    })
  }
}

module.exports = {
  createServer,
  Socket
}