const vorpal = require('vorpal')();
const Blockchain = require('./blockchain')
const {
  formatLog
} = require('./utils')


let bc = new Blockchain();

vorpal
  .command('mine', '挖矿')
  .action(function (args, callback) {
    formatLog(bc.mine());
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