const crypto = require('crypto');
const dist0 = crypto.createHash('sha256').update('hello block-chain').digest('hex')

const dist1 = crypto.createHash('sha256').update('hello1 block-chain').digest('hex')

const dist2 = crypto.createHash('sha256').update('hello').update(' block-chain').digest('hex')


console.log('dist0', dist0)
console.log('dist1', dist1)
console.log('dist2', dist2)