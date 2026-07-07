import bcrypt from 'bcryptjs'; // Pure JS variant preventing Windows native crashes
import jwt from 'jsonwebtoken';

/**
 * Hashes a plain text password safely using an optimal salt round factor.
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('❌ Security Hash Utility Error:', error.message);
    throw new Error('Password encryption processing failure.');
  }
};

/**
 * Compares an incoming plain text password against a saved secure hash string.
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('❌ Security Comparison Utility Error:', error.message);
    return false;
  }
};

/**
 * Generates a signed, stateless JSON Web Token for the user session.
 */
export const generateToken = (userId, role) => {
  try {
    const secret = process.env.JWT_SECRET || 'amie_emergency_backup_secret_signature_key';
    return jwt.sign(
      { userId, role },
      secret,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('❌ Token Signature Utility Error:', error.message);
    throw new Error('Identity token generation failure.');
  }
};

/**
 * Verifies an incoming client JSON Web Token against our secret key context.
 * Satisfies route guard conditions inside auth.middleware.js
 */
export const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'amie_emergency_backup_secret_signature_key';
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('❌ Token Verification Utility Error:', error.message);
    return null; // Express middleware handles null values as unauthorized automatically
  }
};