// ================================================================================================
// ÍNDICE DE UTILIDADES COMPARTIDAS
// ================================================================================================
// Centraliza todas las exportaciones de utilidades para facilitar las importaciones
// ================================================================================================

// ================================================================================================
// SISTEMA DE LOGGING
// ================================================================================================

// Exportar logger y tipos relacionados
export {
  log,
  Logger,
  createLogger,
  exportLogs,
  formatLogsForExport,
  type LogLevel,
  type LogEntry,
  type LoggerConfig,
  type LogFilters
} from './logger';

// ================================================================================================
// VALIDACIONES
// ================================================================================================

// Exportar todas las funciones de validación
export {
  // Patrones y mensajes
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  
  // Validadores básicos
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMin,
  validateMax,
  validatePattern,
  
  // Validadores específicos
  validateEmail,
  validatePassword,
  validateStrongPassword,
  validatePhone,
  validatePositiveDecimal,
  validateLettersOnly,
  validateNumbersOnly,
  validateUUID,
  
  // Validador genérico
  validateField,
  validateSchema,
  isSchemaValid,
  
  // Helpers para formularios
  getFirstError,
  getAllErrors,
  getValidationClasses,
  
  // Validadores de negocio
  validateAdminData,
  validateClubData,
  
  // Tipos
  type ValidationResult,
  type ValidationRule,
  type ValidationSchema
} from './validation';

// ================================================================================================
// FORMATEO Y TRANSFORMACIÓN
// ================================================================================================

// Exportar todas las funciones de formateo
export {
  // Formateo de fechas
  formatDate,
  formatRelativeTime,
  formatDateForInput,
  formatDateTimeForInput,
  
  // Formateo de números
  formatNumber,
  formatPercentage,
  formatNumberWithSuffix,
  
  // Formateo de moneda
  formatCurrency,
  formatSalary,
  
  // Formateo de texto
  capitalize,
  truncateText,
  generateSlug,
  formatName,
  getInitials,
  
  // Formateo de archivos
  formatFileSize,
  
  // Formateo específico de la app
  formatAdminStatus,
  formatAdminRole,
  formatEmailForDisplay,
  
  // Transformaciones seguras
  safeParseNumber,
  safeParseInt,
  
  // Tipos
  type DateFormatOptions,
  type NumberFormatOptions,
  type CurrencyFormatOptions,
  type TextFormatOptions
} from './formatters';

// ================================================================================================
// UTILIDADES ADICIONALES (futuras)
// ================================================================================================

// Aquí se pueden agregar más utilidades conforme crezca la aplicación:
// - Helpers para localStorage/sessionStorage
// - Utilidades de async/await
// - Helpers para URLs y rutas
// - Utilidades de comparación y ordenamiento
// - Helpers para manipulación de arrays/objetos
// - Utilidades de criptografía/seguridad
// - etc.

// ================================================================================================
// EXPORTACIÓN POR DEFECTO
// ================================================================================================

// Objeto con todas las utilidades agrupadas para importación conveniente
const utils = {
  // Logging
  log,
  Logger,
  createLogger,
  
  // Validación
  validation: {
    patterns: VALIDATION_PATTERNS,
    messages: VALIDATION_MESSAGES,
    validateEmail,
    validatePassword,
    validateField,
    validateSchema,
    isSchemaValid,
    getValidationClasses
  },
  
  // Formateo
  format: {
    date: formatDate,
    currency: formatCurrency,
    number: formatNumber,
    text: truncateText,
    slug: generateSlug,
    name: formatName,
    fileSize: formatFileSize
  }
};

export default utils;

// ================================================================================================
// COMENTARIOS PARA DESARROLLO
// ================================================================================================

/**
 * GUÍA DE USO DE UTILIDADES COMPARTIDAS:
 * 
 * 1. IMPORTACIÓN ESPECÍFICA (recomendado):
 *    import { log, validateEmail, formatCurrency } from '@/shared/utils';
 * 
 * 2. IMPORTACIÓN AGRUPADA:
 *    import utils from '@/shared/utils';
 *    utils.log.info('Component', 'action', 'message');
 *    utils.validation.validateEmail(email);
 *    utils.format.currency(amount);
 * 
 * 3. IMPORTACIÓN DIRECTA DE MÓDULO:
 *    import { log } from '@/shared/utils/logger';
 *    import { validateEmail } from '@/shared/utils/validation';
 * 
 * CUÁNDO USAR CADA MÉTODO:
 * 
 * - Específica: Cuando solo necesitas 1-3 funciones
 * - Agrupada: Cuando usas muchas utilidades del mismo tipo
 * - Directa: Para casos especiales o cuando el bundle size importa
 * 
 * EJEMPLOS PRÁCTICOS:
 * 
 * // En un componente de formulario
 * import { validateEmail, getValidationClasses, log } from '@/shared/utils';
 * 
 * // En un hook de datos
 * import { log, formatCurrency, formatDate } from '@/shared/utils';
 * 
 * // En un servicio
 * import { log } from '@/shared/utils/logger';
 */
