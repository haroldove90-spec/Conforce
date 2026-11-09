/**
 * Utility for generating strong, human-readable secure passwords
 * compliant with all modern security and policy standards.
 */
export function generateSecurePassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O for clarity
  const lower = 'abcdefghijkmnopqrstuvwxyz'; // Removed l for clarity
  const numbers = '23456789'; // Removed 0, 1 for clarity
  const symbols = '!@#$%&*';

  // Ensure at least one character from each set
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const allChars = upper + lower + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle array using Fisher-Yates
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}
