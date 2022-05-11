const vorpal = require('vorpal')();
const Blockchain = require('./blockchain')
const rsa = require('./rsa')
const {
  formatLog
} = require('./utils')


let bc = new Blockchain();

vorpal
  .command('mine', '挖矿')
  .action(function (args, callback) {
    formatLog(bc.mine(rsa.keys.pub));
    callback();
  })

vorpal
  .command('detail <index>', '查看区块详情')
  .action(function (args, callback) {
    var detail = bc.findBlockDetail(args.index);
    console.log(detail)
    callback();
  })

vorpal
  .command('trans <to> <amount>', '转账')
  .action(function (args, callback) {
    let trans = bc.transfer(rsa.keys.pub, args.to, args.amount)
    if (trans) {
      formatLog(trans)
    }

    callback();
  })
vorpal
  .command('blance', '查看余额')
  .action(function (args, callback) {
    let wallet = bc.blance(rsa.keys.pub)
    // console.log(wallet)
    if (wallet) {
      formatLog({
        wallet,
        address: rsa.keys.pub
      })
    }
    callback();
  })

vorpal
  .command('chain', '查看 区块链')
  .action(function (args, callback) {
    formatLog(bc.getBlockChain());
    callback();
  })

vorpal
  .command('peers', '查看网络节点列表')
  .action(function (args, callback) {
    formatLog(bc.getPeers());
    callback();
  })
vorpal
  .command('chat <msg>', '跟别人节点hi一下')
  .action(function (args, callback) {
    bc.sendMsg(args.msg)
    callback();
  })
vorpal
  .command('pedding ', '查看未打包的交易')
  .action(function (args, callback) {
    formatLog(bc.getData())
    callback();
  })
vorpal
  .command('pub', '查看本地地址')
  .action(function (args, callback) {
    console.log(rsa.keys.pub)
    callback();
  })

vorpal
  .command('exit ', '退出')
  .action(function (args, callback) {
    bc.leaveP2p();

    setTimeout(() => {
      process.exit()
    }, 1000);
    callback();
  })

vorpal.exec('help')
vorpal
  .delimiter('chain =>$')
  .show()