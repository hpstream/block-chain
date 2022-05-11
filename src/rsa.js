var EC = require('elliptic').ec;
var fs = require('fs');

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// Generate keys
var keyPair = ec.genKeyPair();
// getPrivate 
// getPublic

function getPub(prv) {
  return ec.keyFromPrivate(prv).getPublic('hex').toString()
}

function generateKeys() {
  const fileName = './wallet.json'
  try {
    var res = JSON.parse(fs.readFileSync(fileName, {
      encoding: 'utf8'
    }))
    if (res.prv && res.pub && getPub(res.prv) === res.pub) {
      keyPair = ec.keyFromPrivate(res.prv)
      return res;
    } else {
      throw `not valid wallet.json`
    }
  } catch (error) {
    const res = {
      prv: keyPair.getPrivate('hex').toString(),
      pub: keyPair.getPublic('hex').toString()
    }
    fs.writeFileSync(fileName, JSON.stringify(res))
    return res;
  }
}

function sign({
  from,
  to,
  amount,
  timestamp
}) {
  const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
  let sinature = Buffer.from(keyPair.sign(bufferMsg).toDER()).toString('hex')
  return sinature
}

function verify({
  from,
  to,
  amount,
  timestamp,
  signature
}, pub) {
  const keyPairTemp = ec.keyFromPublic(pub, 'hex');
  const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
  return keyPairTemp.verify(bufferMsg, signature)
}
const keys = generateKeys()
module.exports = {
  sign,
  verify,
  keys
}