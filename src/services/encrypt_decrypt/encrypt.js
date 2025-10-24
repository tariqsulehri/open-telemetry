const CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Base64.parse(process.env.ENCRYPTION_KEY);
const iv = CryptoJS.enc.Base64.parse(process.env.ENCRYPTION_IV);

/**
 * Encrypt data into Base64 string.
 */
function encryptString(data) {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString(); 
  } catch (error) {
    return null;
  }
}

/**
 * Decrypt Base64 string into original data object.
 */
function decryptString(encryptedString) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
      iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedUtf8 = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedUtf8) {
      throw new Error("Decryption resulted in an empty string");
    }

    return JSON.parse(decryptedUtf8);
  } catch (error) {
    return null;
  }
}

module.exports = { encryptString, decryptString };
