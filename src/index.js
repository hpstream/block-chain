const vorpal = require('vorpal')();
const Blockchain = require('./blockchain')
const {
  formatLog
} = require('./utils')


let bc = new Blockchain();

vorpal
  .command('mine <address>', '挖矿')
  .action(function (args, callback) {
    formatLog(bc.mine(args.address));
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
  .command('trans <from> <to> <amount>', '转账')
  .action(function (args, callback) {
    let trans = bc.transfer(args.from, args.to, args.amount)
    if (trans) {
      formatLog(trans)
    }

    callback();
  })
vorpal
  .command('blance <address>', '查看余额')
  .action(function (args, callback) {
    let wallet = bc.blance(args.address)
    console.log(wallet)
    if (wallet) {
      formatLog({
        wallet,
        address: args.address
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

vorpal.exec('help')
vorpal
  .delimiter('chain =>$')
  .show()