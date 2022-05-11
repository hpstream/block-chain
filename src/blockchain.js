const crypto = require('crypto')
const dgram = require('dgram')
const rsa = require('./rsa')

// 创世区块
let initBlock = {
  index: 0,
  data: 'hello block-chain',
  prevHash: '0',
  timestamp: 1652002445297,
  nonce: 106790,
  hash: '00002ba41d1e7fc74a1e1c8623180e855d26a51da9a6de9eb35abab166ccd20b'
}
module.exports = class Blockchain {
  constructor() {
    this.blockchain = [initBlock];
    this.data = [];
    this.difficulty = 4;
    // 所有的网络节点信息，address,port
    this.peers = [];
    //
    this.remote = {};
    // 种子节点
    this.seed = {
      port: 8001,
      address: 'localhost'
    }
    this.udp = dgram.createSocket('udp4');
    this.init();

  }
  init() {
    this.bindP2p();
    this.bindExit();
  }
  bindP2p() {
    // 网络发来的请求
    this.udp.on('message', (data, remote) => {
      const {
        address,
        port
      } = remote;
      const action = JSON.parse(data);
      // {
      //   type:'',
      //   data:{}
      // }
      // console.log('type', action.type)
      if (action.type) {
        this.dispatch(action, {
          address,
          port
        })
      }
    })

    this.udp.on('listening', () => {
      const address = this.udp.address();
      console.log(`[信息]： udp监听完毕 端口是:${address.port}`)
    })
    // 区分种子节点和普通节点，普通阶段端口号0即可，随便分配一个空闲端口
    // 种子阶段必须是固定的端口号
    let port = Number(process.argv[2]) || 0
    this.starNode(port)
  }
  starNode(port) {
    this.udp.bind(port)
    if (port !== 8001) {
      this.send({
        type: 'newpper',
      }, this.seed.port, this.seed.address)
      this.peers.push(this.seed)
    }
  }
  dispatch(action, remote) {
    switch (action.type) {
      case 'newpper':
        // 种子节点要做的事情
        // 1.你的公网ip和port是啥
        this.send({
          type: 'remoteAddress',
          data: remote
        }, remote.port, remote.address)
        // 2.现在全部节点的列表
        this.send({
          type: 'peerlist',
          data: this.peers
        }, remote.port, remote.address)

        // 3.告诉所有已经节点，来了新朋友，赶快打招呼
        this.boardcast({
          type: 'sayhi',
          data: remote
        })
        this.peers.push(remote)
        // 4.告诉你现在区块链的数据
        // console.log(`你好我是新节点`, remote)
        break;
      case 'remoteAddress':
        // 存放远程消息，退出的时候用
        this.remote = action.data
        break;
      case 'peerlist':
        // 远程告诉我，现在的阶段列表
        const newPeers = action.data;
        this.addPeers(newPeers)
        break;
      case 'sayhi':
        let remotePeer = action.data;
        this.peers.push(remotePeer);
        console.log(`[信息] 新朋友你好，相识就是缘分，请你喝茶`)
        this.send({
          type: 'hi',
          data: 'hi'
        }, remote.port, remote.address)
        break;
      case 'hi':
        // console.log(this.peers)
        console.log(`${remote.address}:${remote.port} 发送消息: ${action.data}`)
        break;
      case 'removePeer':
        this.removePeer(action, remote.port, remote.address)
        break;

      default:
        console.log(`这个action不认识`)
        break;
    }

  }
  removePeer(action) {
    // console.log(action)
    var peer = action.data;
    var index = this.peers.findIndex(v => this.isEqualPeer(peer, v));
    this.peers.splice(index, 1);
  }
  boardcast(action) {
    // console.log(this.peers)
    this.peers.forEach((v) => {
      this.send(action, v.port, v.address)
    })
  }
  isEqualPeer(peer1, peer2) {
    return peer1.address === peer2.address && peer1.port === peer2.port
  }
  addPeers(peers) {
    peers.forEach(peer => {
      // 如果节点不存在，就添加一个到peers中
      if (!this.peers.find(v => this.isEqualPeer(peer, v))) {
        this.peers.push(peer)
      }
    })
  }
  send(data, port, address) {
    this.udp.send(JSON.stringify(data), port, address)
  }
  bindExit() {
    process.on('exit', () => {
      // console.log(this.peers)
      console.log(`[信息]： 有缘再见 ${this.remote.address} ${this.remote.port}`);
    })
  }
  // 群发消息
  sendMsg(msg) {
    this.boardcast({
      type: 'hi',
      data: msg
    })
  }
  // 离开p2p网络：
  leaveP2p() {
    this.boardcast({
      type: 'removePeer',
      data: this.remote
    })
  }
  // 获取网络节点
  getPeers() {
    return this.peers || []
  }
  // 查看余额
  blance(address) {
    let blance = 0;
    this.blockchain.forEach(block => {
      // 创世区块是一个字符串，所以不用遍历

      if (Array.isArray(block.data)) {
        block.data.forEach((trans) => {
          if (address === trans.from) {
            blance -= trans.amount
          }
          if (address === trans.to) {
            blance += trans.amount
          }
        })
      }

    })

    return blance
  }
  // 查看区块链
  getBlockChain() {
    return this.blockchain
  }
  // 进行交易
  transfer(from, to, amount) {
    // 签名校验，后面完成
    if (from !== '0') {
      // 交易非挖矿
      const blance = this.blance(from)
      if (blance < amount) {
        console.log('not enough blance', from, blance, amount)
        return
      }
    }
    let sig = rsa.sign({
      from,
      to,
      amount
    })
    let transObj = {
      from,
      to,
      amount,
      sig
    }

    this.data.push(transObj)

    return transObj
  }
  // 查看区块详情
  findBlockDetail(index) {
    return this.blockchain[index]
  }
  // 获取最新区块
  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1]
  }
  // 生成新区块
  generateNewBlock() {

    let nonce = 0; // 随机数
    let index = this.blockchain.length; // 区块索引
    let data = this.data;
    let prevHash = this.getLastBlock().hash;
    let timestamp = new Date().getTime();
    let hash = this.computeHash(index, prevHash, timestamp, data, nonce)

    while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce += 1;
      hash = this.computeHash(index, prevHash, timestamp, data, nonce)
    }
    return {
      index,
      data,
      timestamp,
      prevHash,
      nonce,
      hash
    }
  }
  isValidTransfer(trans) {
    return rsa.verify(trans, trans.from)
  }

  // 挖矿
  mine(address) {
    // 校验合法性
    if (!this.data.every(v => this.isValidTransfer(v))) {
      console.log(`trans not valid`)
      return
    }
    // 1. 生成新区块 一页新的记账加入了区块链
    // 2. 不停的计算哈希， 知道计算出符合条件的哈希值，获得记账权
    this.transfer('0', address, 100)
    const newBlock = this.generateNewBlock();
    // console.log(this.isValidBlock(newBlock))
    if (this.isValidBlock(newBlock) && this.isValidChain()) {
      this.blockchain.push(newBlock)
      this.data = [];
      return newBlock;
    } else {
      console.log('error, invalid Block', newBlock)
    }

    return
  }
  isValidBlock(newBlock, lastBlock = this.getLastBlock()) {
    // const lastBlock = this.getLastBlock();
    // 1.区块的index等于最新区块的index+1
    // console.log(newBlock, lastBlock)
    if (newBlock.index !== lastBlock.index + 1) {
      return false;
    }
    // 2.区块的time大于最新区块
    if (newBlock.timestamp <= lastBlock.timestamp) {
      return false;
    }
    // 3.最新区块的prevHash 等于最新区块的hash
    if (newBlock.prevHash !== lastBlock.hash) {
      return false;
    }
    // 4.区块的hash符合难度
    if (newBlock.hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      return false;
    }
    // 5.校验随机数是否正确
    if (newBlock.hash !== this.computeHashForBlock(newBlock)) {
      return false
    }

    return true



  }
  // 校验区块链
  isValidChain(chain = this.blockchain) {
    // console.log(chain.length)
    for (let i = chain.length - 1; i >= 1; i--) {
      // console.log(chain.length)
      if (!this.isValidBlock(chain[i], chain[i - 1])) {
        // console.log('error invalid Chain')
        return false
      }
    }
    // 校验创世区块
    if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
      return false
    }

    return true;
  }

  computeHashForBlock({
    index,
    prevHash,
    timestamp,
    data,
    nonce
  }) {
    return this.computeHash(index, prevHash, timestamp, data, nonce)
  }
  computeHash(index, prevHash, timestamp, data, nonce) { // 计算hash
    return crypto
      .createHash('sha256')
      .update(index + prevHash + timestamp + data + nonce)
      .digest('hex')
  }
}