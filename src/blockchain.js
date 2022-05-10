const crypto = require('crypto');
const dgram = require('dgram')

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
    }
  }
  dispatch(action, remote) {
    switch (action.type) {
      case 'newpper':
        console.log(`你好我是新节点`, remote)
        break;

      default:
        break;
    }

  }
  send(data, port, address) {
    this.udp.send(JSON.stringify(data), port, address)
  }
  bindExit() {
    process.on('exit', () => {
      console.log(`[信息]： 有缘再见`)
    })
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
    const transObj = {
      from,
      to,
      amount
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
  // 挖矿
  mine(address) {
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