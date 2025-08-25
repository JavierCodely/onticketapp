// ================================================================================================
// UTILIDADES DE VALIDACIÓN COMPARTIDAS
// ================================================================================================
// Conjunto de funciones de validación reutilizables en toda la aplicación.
// Incluye validaciones comunes, patrones de regex, y helpers para formularios.
// ================================================================================================

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

/**
 * Resultado de una validación
 */
export interface ValidationResult {
  isValid: boolean;                // Si la validación pasó
  message?: string;                // Mensaje de error si la validación falló
  code?: string;                   // Código de error específico
}

/**
 * Reglas de validación para un campo
 */
export interface ValidationRule {
  required?: boolean;              // Si el campo es obligatorio
  minLength?: number;              // Longitud mínima
  maxLength?: number;              // Longitud máxima
  min?: number;                    // Valor mínimo (para números)
  max?: number;                    // Valor máximo (para números)
  pattern?: RegExp;                // Patrón regex
  custom?: (value: any) => ValidationResult; // Validación personalizada
}

/**
 * Conjunto de reglas de validación para múltiples campos
 */
export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

// ================================================================================================
// PATRONES REGEX COMUNES
// ================================================================================================

export const VALIDATION_PATTERNS = {
  // Email básico pero robusto
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Contraseña fuerte: al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  
  // Contraseña media: al menos 8 caracteres
  MEDIUM_PASSWORD: /^.{8,}$/,
  
  // Solo números
  NUMBERS_ONLY: /^\d+$/,
  
  // Números decimales positivos
  POSITIVE_DECIMAL: /^\d+(\.\d{1,2})?$/,
  
  // Teléfono (formato flexible)
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  
  // Slug (URL friendly)
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // Solo letras y espacios
  LETTERS_SPACES: /^[a-zA-ZÀ-ÿ\s]+$/,
  
  // Alfanumérico con espacios
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9À-ÿ\s]+$/,
  
  // UUID v4
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// ================================================================================================
// MENSAJES DE ERROR PREDEFINIDOS
// ================================================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Ingresa un email válido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 8 caracteres',
  INVALID_STRONG_PASSWORD: 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede tener más de ${max} caracteres`,
  MIN_VALUE: (min: number) => `El valor mínimo es ${min}`,
  MAX_VALUE: (max: number) => `El valor máximo es ${max}`,
  INVALID_FORMAT: 'El formato no es válido',
  ONLY_LETTERS: 'Solo se permiten letras y espacios',
  ONLY_NUMBERS: 'Solo se permiten números',
  INVALID_PHONE: 'Ingresa un número de teléfono válido',
  INVALID_DECIMAL: 'Ingresa un número decimal válido'
};

// ================================================================================================
// VALIDADORES BÁSICOS
// ================================================================================================

/**
 * Valida si un valor está presente (no vacío, null o undefined)
 * @param value - Valor a validar
 * @returns Resultado de validación
 */
export const validateRequired = (value: any): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== '';
  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.REQUIRED,
    code: isValid ? undefined : 'REQUIRED'
  };
};

/**
 * Valida la longitud mínima de una string
 * @param value - Valor a validar
 * @param minLength - Longitud mínima requerida
 * @returns Resultado de validación
 */
export const validateMinLength = (value: string, minLength: number): ValidationResult => {
  const isValid = !value || value.length >= minLength;
  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.MIN_LENGTH(minLength),
    code: isValid ? undefined : 'MIN_LENGTH'
  };
};

/**
 * Valida la longitud máxima de una string
 * @param value - Valor a validar
 * @param maxLength - Longitud máxima permitida
 * @returns Resultado de validación
 */
export const validateMaxLength = (value: string, maxLength: number): ValidationResult => {
  const isValid = !value || value.length <= maxLength;
  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.MAX_LENGTH(maxLength),
    code: isValid ? undefined : 'MAX_LENGTH'
  };
};

/**
 * Valida el valor mínimo de un número
 * @param value - Valor a validar
 * @param min - Valor mínimo permitido
 * @returns Resultado de validación
 */
export const validateMin = (value: number, min: number): ValidationResult => {
  const isValid = isNaN(value) || value >= min;
  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.MIN_VALUE(min),
    code: isValid ? undefined : 'MIN_VALUE'
  };
};

/**
 * Valida el valor máximo de un número
 * @param value - Valor a validar
 * @param max - Valor máximo permitido
 * @returns Resultado de validación
 */
export const validateMax = (value: number, max: number): ValidationResult => {
  const isValid = isNaN(value) || value <= max;
  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.MAX_VALUE(max),
    code: isValid ? undefined : 'MAX_VALUE'
  };
};

/**
 * Valida un patrón regex
 * @param value - Valor a validar
 * @param pattern - Patrón regex
 * @param message - Mensaje de error personalizado
 * @returns Resultado de validación
 */
export const validatePattern = (
  value: string, 
  pattern: RegExp, 
  message: string = VALIDATION_MESSAGES.INVALID_FORMAT
): ValidationResult => {
  const isValid = !value || pattern.test(value);
  return {
    isValid,
    message: isValid ? undefined : message,
    code: isValid ? undefined : 'INVALID_PATTERN'
  };
};

// ================================================================================================
// VALIDADORES ESPECÍFICOS
// ================================================================================================

/**
 * Valida un email
 * @param email - Email a validar
 * @returns Resultado de validación
 */
export const validateEmail = (email: string): ValidationResult => {
  return validatePattern(email, VALIDATION_PATTERNS.EMAIL, VALIDATION_MESSAGES.INVALID_EMAIL);
};

/**
 * Valida una contraseña (nivel básico)
 * @param password - Contraseña a validar
 * @returns Resultado de validación
 */
export const validatePassword = (password: string): ValidationResult => {
  return validatePattern(password, VALIDATION_PATTERNS.MEDIUM_PASSWORD, VALIDATION_MESSAGES.INVALID_PASSWORD);
};

/**
 * Valida una contraseña fuerte
 * @param password - Contraseña a validar
 * @returns Resultado de validación
 */
export const validateStrongPassword = (password: string): ValidationResult => {
  return validatePattern(password, VALIDATION_PATTERNS.STRONG_PASSWORD, VALIDATION_MESSAGES.INVALID_STRONG_PASSWORD);
};

/**
 * Valida un número de teléfono
 * @param phone - Teléfono a validar
 * @returns Resultado de validación
 */
export const validatePhone = (phone: string): ValidationResult => {
  return validatePattern(phone, VALIDATION_PATTERNS.PHONE, VALIDATION_MESSAGES.INVALID_PHONE);
};

/**
 * Valida un número decimal positivo
 * @param value - Valor a validar
 * @returns Resultado de validación
 */
export const validatePositiveDecimal = (value: string): ValidationResult => {
  return validatePattern(value, VALIDATION_PATTERNS.POSITIVE_DECIMAL, VALIDATION_MESSAGES.INVALID_DECIMAL);
};

/**
 * Valida solo letras y espacios
 * @param value - Valor a validar
 * @returns Resultado de validación
 */
export const validateLettersOnly = (value: string): ValidationResult => {
  return validatePattern(value, VALIDATION_PATTERNS.LETTERS_SPACES, VALIDATION_MESSAGES.ONLY_LETTERS);
};

/**
 * Valida solo números
 * @param value - Valor a validar
 * @returns Resultado de validación
 */
export const validateNumbersOnly = (value: string): ValidationResult => {
  return validatePattern(value, VALIDATION_PATTERNS.NUMBERS_ONLY, VALIDATION_MESSAGES.ONLY_NUMBERS);
};

/**
 * Valida un UUID v4
 * @param uuid - UUID a validar
 * @returns Resultado de validación
 */
export const validateUUID = (uuid: string): ValidationResult => {
  return validatePattern(uuid, VALIDATION_PATTERNS.UUID_V4, 'UUID inválido');
};

// ================================================================================================
// VALIDADOR GENÉRICO CON REGLAS
// ================================================================================================

/**
 * Valida un valor contra un conjunto de reglas
 * @param value - Valor a validar
 * @param rules - Reglas de validación a aplicar
 * @returns Resultado de validación (falla en la primera regla que no pase)
 */
export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  // Validar requerido primero
  if (rules.required) {
    const requiredResult = validateRequired(value);
    if (!requiredResult.isValid) {
      return requiredResult;
    }
  }

  // Si el valor está vacío y no es requerido, es válido
  if (!value && !rules.required) {
    return { isValid: true };
  }

  // Validar longitud mínima
  if (rules.minLength && typeof value === 'string') {
    const result = validateMinLength(value, rules.minLength);
    if (!result.isValid) return result;
  }

  // Validar longitud máxima
  if (rules.maxLength && typeof value === 'string') {
    const result = validateMaxLength(value, rules.maxLength);
    if (!result.isValid) return result;
  }

  // Validar valor mínimo
  if (rules.min !== undefined && typeof value === 'number') {
    const result = validateMin(value, rules.min);
    if (!result.isValid) return result;
  }

  // Validar valor máximo
  if (rules.max !== undefined && typeof value === 'number') {
    const result = validateMax(value, rules.max);
    if (!result.isValid) return result;
  }

  // Validar patrón
  if (rules.pattern && typeof value === 'string') {
    const result = validatePattern(value, rules.pattern);
    if (!result.isValid) return result;
  }

  // Validación personalizada
  if (rules.custom) {
    const result = rules.custom(value);
    if (!result.isValid) return result;
  }

  return { isValid: true };
};

/**
 * Valida múltiples campos contra un schema de validación
 * @param data - Objeto con los datos a validar
 * @param schema - Schema de validación
 * @returns Objeto con resultados de validación por campo
 */
export const validateSchema = (
  data: Record<string, any>, 
  schema: ValidationSchema
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  Object.keys(schema).forEach(fieldName => {
    const value = data[fieldName];
    const rules = schema[fieldName];
    results[fieldName] = validateField(value, rules);
  });

  return results;
};

/**
 * Verifica si todos los campos en un resultado de validación son válidos
 * @param validationResults - Resultados de validación
 * @returns true si todos los campos son válidos
 */
export const isSchemaValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

// ================================================================================================
// HELPERS PARA FORMULARIOS
// ================================================================================================

/**
 * Obtiene el primer mensaje de error de un resultado de validación
 * @param validationResults - Resultados de validación
 * @returns Primer mensaje de error encontrado o undefined
 */
export const getFirstError = (validationResults: Record<string, ValidationResult>): string | undefined => {
  for (const result of Object.values(validationResults)) {
    if (!result.isValid && result.message) {
      return result.message;
    }
  }
  return undefined;
};

/**
 * Obtiene todos los mensajes de error de un resultado de validación
 * @param validationResults - Resultados de validación
 * @returns Array con todos los mensajes de error
 */
export const getAllErrors = (validationResults: Record<string, ValidationResult>): string[] => {
  return Object.values(validationResults)
    .filter(result => !result.isValid && result.message)
    .map(result => result.message!);
};

/**
 * Genera clases CSS para un campo basado en su estado de validación
 * @param validationResult - Resultado de validación del campo
 * @param hasValue - Si el campo tiene valor
 * @returns String con clases CSS
 */
export const getValidationClasses = (
  validationResult?: ValidationResult, 
  hasValue: boolean = false
): string => {
  const baseClasses = 'transition-all duration-200';
  
  if (!validationResult || !hasValue) {
    return baseClasses;
  }
  
  if (validationResult.isValid) {
    return `${baseClasses} border-green-500/50 focus:border-green-500`;
  } else {
    return `${baseClasses} border-red-500/50 focus:border-red-500`;
  }
};

// ================================================================================================
// VALIDADORES ESPECÍFICOS DE NEGOCIO
// ================================================================================================

/**
 * Valida datos de administrador
 * @param adminData - Datos del administrador
 * @returns Resultados de validación
 */
export const validateAdminData = (adminData: {
  email: string;
  full_name: string;
  password: string;
  salary: string;
}): Record<string, ValidationResult> => {
  const schema: ValidationSchema = {
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.EMAIL
    },
    full_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: VALIDATION_PATTERNS.LETTERS_SPACES
    },
    password: {
      required: true,
      minLength: 8,
      pattern: VALIDATION_PATTERNS.MEDIUM_PASSWORD
    },
    salary: {
      required: false,
      pattern: VALIDATION_PATTERNS.POSITIVE_DECIMAL
    }
  };

  return validateSchema(adminData, schema);
};

/**
 * Valida datos de club
 * @param clubData - Datos del club
 * @returns Resultados de validación
 */
export const validateClubData = (clubData: {
  name: string;
  slug: string;
  description?: string;
}): Record<string, ValidationResult> => {
  const schema: ValidationSchema = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    slug: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.SLUG
    },
    description: {
      required: false,
      maxLength: 500
    }
  };

  return validateSchema(clubData, schema);
};

// ================================================================================================
// EXPORTACIONES POR DEFECTO
// ================================================================================================

export default {
  patterns: VALIDATION_PATTERNS,
  messages: VALIDATION_MESSAGES,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMin,
  validateMax,
  validatePattern,
  validateEmail,
  validatePassword,
  validateStrongPassword,
  validatePhone,
  validatePositiveDecimal,
  validateLettersOnly,
  validateNumbersOnly,
  validateUUID,
  validateField,
  validateSchema,
  isSchemaValid,
  getFirstError,
  getAllErrors,
  getValidationClasses,
  validateAdminData,
  validateClubData
};
