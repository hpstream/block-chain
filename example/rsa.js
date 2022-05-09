var EC = require('elliptic').ec;

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// Generate keys
var keyPair = ec.genKeyPair();
// getPrivate 
// getPublic
const res = {
  prv: keyPair.getPrivate('hex').toString(),
  pub: keyPair.getPublic('hex').toString()
}

// Sign the message's hash (input must be an array, or a hex-string)
var msgHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var signature = keyPair.sign(msgHash);

// Export DER encoded signature in Array
var derSign = signature.toDER('hex');
console.log(derSign)

// Verify signature
console.log(keyPair.verify(msgHash, derSign));