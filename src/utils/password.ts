// ================================================================================================
// UTILIDADES PARA MANEJO DE CONTRASEÑAS
// ================================================================================================

/**
 * Genera una contraseña temporal segura con combinación de letras, números y símbolos
 * @param length - Longitud de la contraseña (por defecto 12)
 * @returns Contraseña temporal generada
 */
export function generateTempPassword(length: number = 12): string {
  // Conjuntos de caracteres para generar contraseñas seguras
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Combinar todos los caracteres
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Garantizar que la contraseña tenga al menos un carácter de cada tipo
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Llenar el resto con caracteres aleatorios
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar los caracteres para que no sean predecibles
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Valida la fortaleza de una contraseña
 * @param password - Contraseña a validar
 * @returns Objeto con información sobre la fortaleza
 */
export function validatePasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (passedChecks >= 5) strength = 'strong';
  else if (passedChecks >= 4) strength = 'good';
  else if (passedChecks >= 3) strength = 'fair';
  
  return {
    strength,
    checks,
    score: passedChecks,
    maxScore: 5
  };
}

/**
 * Genera una contraseña específicamente para administradores
 * Incluye patrones que son fáciles de recordar pero seguros
 */
export function generateAdminPassword(): string {
  const words = ['Admin', 'Manage', 'Club', 'Night', 'Event', 'Staff'];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const symbols = ['!', '@', '#', '$', '%'];
  
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  return `${word1}${word2}${numbers}${symbol}`;
}

/**
 * Genera una contraseña específicamente para empleados
 * Más simple pero aún segura
 */
export function generateEmployeePassword(): string {
  const words = ['Work', 'Club', 'Team', 'Staff', 'Night'];
  const numbers = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const symbols = ['!', '@', '#'];
  
  const word = words[Math.floor(Math.random() * words.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  return `${word}${numbers}${symbol}`;
}
