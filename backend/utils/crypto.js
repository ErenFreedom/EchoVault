const crypto = require('crypto');

// Function to hash data (e.g., passwords)
exports.hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Function to generate a random cryptographic string, useful for tokens
exports.generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Simple encryption and decryption functions
exports.encryptText = (text, secretKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

exports.decryptText = (hash, secretKey) => {
  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, Buffer.from(hash.iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrypted.toString();
};
