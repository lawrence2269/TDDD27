const crypto = require('crypto');

const secret_key = crypto.randomBytes(256).toString('hex');
const refresh_key = crypto.randomBytes(256).toString('hex');
console.log({"key 1":secret_key,"key 2":refresh_key});