const crypto = require('crypto');
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
    // const hash = this.computeHash(0, '0', 1652002445297, 'hello block-chain', 2)
  }
  // 查看区块链
  getBlockChain() {
    return this.blockchain
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
  mine() {
    // 1. 生成新区块 一页新的记账加入了区块链
    // 2. 不停的计算哈希， 知道计算出符合条件的哈希值，获得记账权
    const newBlock = this.generateNewBlock();
    // console.log(this.isValidBlock(newBlock))
    if (this.isValidBlock(newBlock) && this.isValidChain()) {
      this.blockchain.push(newBlock)
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