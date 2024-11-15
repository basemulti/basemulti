const crypto = require('crypto');

// 生成一个随机的32字节的hex字符串
const key = crypto.randomBytes(32).toString('hex');

console.log(`Generated key: ${key}`);
console.log('Please copy this key and add it to your .env file as follows:');
console.log(`BASEMULTI_KEY=${key}`);