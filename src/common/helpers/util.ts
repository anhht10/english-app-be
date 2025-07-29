import { randomBytes } from 'node:crypto';

const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async (
  plainPassword: string,
): Promise<string> => {
  try {
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

export const comparePasswordHelper = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Password comparison failed');
  }
};

export const randomCodeHelper = (length: number = 6): string => {
  const buffer = randomBytes(Math.ceil(length / 2));
  const hexString = buffer.toString('hex');

  const code = parseInt(hexString, 16) % Math.pow(10, length);
  return code.toString().padStart(length, '0');
};

export const parseDuration = (time: string) => {
  const regax = /^(\d+)([smhdwmy])$/;
  const match = time.match(regax);

  if (!match) {
    throw new Error('Invalid time format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    case 'w':
      return value * 60 * 60 * 24 * 7;
    case 'M':
      return value * 60 * 60 * 24 * 30;
    case 'y':
      return value * 60 * 60 * 24 * 365;
    default:
      throw new Error('Unsupported time unit');
  }
};
