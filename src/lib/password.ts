import CryptoJS from 'crypto-js';

// 加密密钥（从环境变量读取）
const SECRET_KEY = process.env.PASSWORD_SECRET_KEY || 'default-secret-key-please-change';

/**
 * 加密密码（AES 可逆加密）
 * @param password 明文密码
 * @returns 加密后的密码
 */
export function encryptPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}

/**
 * 解密密码
 * @param encryptedPassword 加密后的密码
 * @returns 明文密码
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decrypt password failed:', error);
    return '';
  }
}

/**
 * 验证密码是否匹配
 * @param password 明文密码
 * @param encryptedPassword 加密后的密码
 * @returns 是否匹配
 */
export function verifyPassword(password: string, encryptedPassword: string): boolean {
  const decrypted = decryptPassword(encryptedPassword);
  return decrypted === password;
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: '密码长度至少为6位',
    };
  }

  if (password.length > 100) {
    return {
      valid: false,
      message: '密码长度不能超过100位',
    };
  }

  return { valid: true };
}





