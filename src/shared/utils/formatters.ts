// ================================================================================================
// UTILIDADES DE FORMATEO Y TRANSFORMACIÓN DE DATOS
// ================================================================================================
// Conjunto de funciones para formatear datos de manera consistente en toda la aplicación.
// Incluye formateo de fechas, números, monedas, texto, y transformaciones comunes.
// ================================================================================================

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

/**
 * Opciones para formateo de fechas
 */
export interface DateFormatOptions {
  locale?: string;                 // Idioma (ej: 'es-AR', 'en-US')
  timeZone?: string;              // Zona horaria
  includeTime?: boolean;          // Si incluir hora
  includeSeconds?: boolean;       // Si incluir segundos
  relative?: boolean;             // Si mostrar tiempo relativo ("hace 2 horas")
}

/**
 * Opciones para formateo de números
 */
export interface NumberFormatOptions {
  locale?: string;                 // Idioma
  minimumFractionDigits?: number; // Dígitos decimales mínimos
  maximumFractionDigits?: number; // Dígitos decimales máximos
  useGrouping?: boolean;          // Si usar separadores de miles
}

/**
 * Opciones para formateo de moneda
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  currency?: string;              // Código de moneda (ej: 'ARS', 'USD')
  style?: 'symbol' | 'code' | 'name'; // Estilo de visualización
}

/**
 * Opciones para formateo de texto
 */
export interface TextFormatOptions {
  maxLength?: number;             // Longitud máxima
  ellipsis?: boolean;             // Si agregar "..." al truncar
  capitalize?: 'first' | 'all' | 'words'; // Tipo de capitalización
}

// ================================================================================================
// CONSTANTES
// ================================================================================================

const DEFAULT_LOCALE = 'es-AR';
const DEFAULT_CURRENCY = 'ARS';
const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

// ================================================================================================
// FORMATEO DE FECHAS
// ================================================================================================

/**
 * Formatea una fecha con opciones flexibles
 * @param date - Fecha a formatear (Date, string ISO, timestamp)
 * @param options - Opciones de formateo
 * @returns Fecha formateada como string
 */
export const formatDate = (
  date: Date | string | number, 
  options: DateFormatOptions = {}
): string => {
  const {
    locale = DEFAULT_LOCALE,
    timeZone = DEFAULT_TIMEZONE,
    includeTime = false,
    includeSeconds = false,
    relative = false
  } = options;

  // Convertir a objeto Date si es necesario
  const dateObj = new Date(date);
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  // Formateo relativo (ej: "hace 2 horas")
  if (relative) {
    return formatRelativeTime(dateObj, locale);
  }

  // Configurar opciones de formateo
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    
    if (includeSeconds) {
      formatOptions.second = '2-digit';
    }
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

/**
 * Formatea tiempo relativo (ej: "hace 2 horas", "en 3 días")
 * @param date - Fecha a comparar
 * @param locale - Idioma
 * @returns Tiempo relativo formateado
 */
export const formatRelativeTime = (date: Date, locale: string = DEFAULT_LOCALE): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Usar Intl.RelativeTimeFormat si está disponible
  if (Intl.RelativeTimeFormat) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    const absDiff = Math.abs(diffInSeconds);
    
    if (absDiff < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (absDiff < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (absDiff < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (absDiff < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (absDiff < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  // Fallback manual si Intl.RelativeTimeFormat no está disponible
  const absDiff = Math.abs(diffInSeconds);
  const isFuture = diffInSeconds < 0;
  
  if (absDiff < 60) {
    return isFuture ? 'en unos segundos' : 'hace unos segundos';
  } else if (absDiff < 3600) {
    const minutes = Math.floor(absDiff / 60);
    return isFuture ? `en ${minutes} minuto${minutes > 1 ? 's' : ''}` : `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (absDiff < 86400) {
    const hours = Math.floor(absDiff / 3600);
    return isFuture ? `en ${hours} hora${hours > 1 ? 's' : ''}` : `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(absDiff / 86400);
    return isFuture ? `en ${days} día${days > 1 ? 's' : ''}` : `hace ${days} día${days > 1 ? 's' : ''}`;
  }
};

/**
 * Formatea fecha para input de tipo date (YYYY-MM-DD)
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export const formatDateForInput = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea fecha y hora para input de tipo datetime-local
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DDTHH:mm
 */
export const formatDateTimeForInput = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const datePart = formatDateForInput(dateObj);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${datePart}T${hours}:${minutes}`;
};

// ================================================================================================
// FORMATEO DE NÚMEROS
// ================================================================================================

/**
 * Formatea un número con opciones flexibles
 * @param number - Número a formatear
 * @param options - Opciones de formateo
 * @returns Número formateado como string
 */
export const formatNumber = (
  number: number, 
  options: NumberFormatOptions = {}
): string => {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options;

  if (isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(number);
};

/**
 * Formatea un número como porcentaje
 * @param number - Número a formatear (0.15 = 15%)
 * @param decimals - Cantidad de decimales
 * @param locale - Idioma
 * @returns Porcentaje formateado
 */
export const formatPercentage = (
  number: number, 
  decimals: number = 1, 
  locale: string = DEFAULT_LOCALE
): string => {
  if (isNaN(number)) return '0%';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Formatea un número con sufijos (K, M, B)
 * @param number - Número a formatear
 * @param decimals - Decimales a mostrar
 * @returns Número formateado con sufijo
 */
export const formatNumberWithSuffix = (number: number, decimals: number = 1): string => {
  if (isNaN(number)) return '0';
  
  const abs = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  
  if (abs >= 1e9) {
    return sign + (abs / 1e9).toFixed(decimals) + 'B';
  } else if (abs >= 1e6) {
    return sign + (abs / 1e6).toFixed(decimals) + 'M';
  } else if (abs >= 1e3) {
    return sign + (abs / 1e3).toFixed(decimals) + 'K';
  } else {
    return sign + abs.toString();
  }
};

// ================================================================================================
// FORMATEO DE MONEDA
// ================================================================================================

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns Cantidad formateada como moneda
 */
export const formatCurrency = (
  amount: number, 
  options: CurrencyFormatOptions = {}
): string => {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    style = 'symbol',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  if (isNaN(amount)) {
    return formatCurrency(0, options);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: style,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
};

/**
 * Formatea un salario con formato más legible
 * @param salary - Salario a formatear
 * @param period - Período (ej: 'mensual', 'anual')
 * @param locale - Idioma
 * @returns Salario formateado
 */
export const formatSalary = (
  salary: number, 
  period: string = 'mensual', 
  locale: string = DEFAULT_LOCALE
): string => {
  const formattedAmount = formatCurrency(salary, { locale });
  return `${formattedAmount} ${period}`;
};

// ================================================================================================
// FORMATEO DE TEXTO
// ================================================================================================

/**
 * Capitaliza texto según diferentes opciones
 * @param text - Texto a capitalizar
 * @param type - Tipo de capitalización
 * @returns Texto capitalizado
 */
export const capitalize = (
  text: string, 
  type: 'first' | 'all' | 'words' = 'first'
): string => {
  if (!text) return '';
  
  switch (type) {
    case 'first':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    
    case 'all':
      return text.toUpperCase();
    
    case 'words':
      return text.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    default:
      return text;
  }
};

/**
 * Trunca texto a una longitud máxima
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param ellipsis - Si agregar "..."
 * @returns Texto truncado
 */
export const truncateText = (
  text: string, 
  maxLength: number, 
  ellipsis: boolean = true
): string => {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  return ellipsis ? truncated + '...' : truncated;
};

/**
 * Genera slug a partir de texto
 * @param text - Texto a convertir
 * @returns Slug URL-friendly
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                    // Normalizar caracteres unicode
    .replace(/[\u0300-\u036f]/g, '')     // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')        // Remover caracteres especiales
    .replace(/\s+/g, '-')                // Reemplazar espacios con guiones
    .replace(/-+/g, '-')                 // Reemplazar múltiples guiones con uno
    .replace(/^-|-$/g, '');              // Remover guiones al inicio y final
};

/**
 * Formatea nombres de forma consistente
 * @param firstName - Nombre
 * @param lastName - Apellido
 * @returns Nombre formateado
 */
export const formatName = (firstName: string, lastName?: string): string => {
  const first = capitalize(firstName?.trim() || '', 'words');
  const last = capitalize(lastName?.trim() || '', 'words');
  
  if (last) {
    return `${first} ${last}`;
  }
  return first;
};

/**
 * Extrae iniciales de un nombre
 * @param name - Nombre completo
 * @param maxInitials - Máximo de iniciales
 * @returns Iniciales
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
};

// ================================================================================================
// FORMATEO DE ARCHIVOS Y TAMAÑOS
// ================================================================================================

/**
 * Formatea tamaño de archivo en bytes a formato legible
 * @param bytes - Tamaño en bytes
 * @param decimals - Decimales a mostrar
 * @returns Tamaño formateado
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// ================================================================================================
// FORMATEO DE DATOS ESPECÍFICOS DE LA APLICACIÓN
// ================================================================================================

/**
 * Formatea estado de administrador para mostrar
 * @param status - Estado del administrador
 * @returns Estado formateado
 */
export const formatAdminStatus = (status: 'active' | 'inactive'): string => {
  const statuses = {
    active: 'Activo',
    inactive: 'Inactivo'
  };
  return statuses[status] || status;
};

/**
 * Formatea rol de administrador para mostrar
 * @param role - Rol del administrador
 * @returns Rol formateado
 */
export const formatAdminRole = (role: 'club_admin' | 'super_admin'): string => {
  const roles = {
    club_admin: 'Admin de Club',
    super_admin: 'Super Admin'
  };
  return roles[role] || role;
};

/**
 * Formatea dirección de email para mostrar (oculta parte del email)
 * @param email - Email a formatear
 * @param showDomain - Si mostrar el dominio completo
 * @returns Email formateado
 */
export const formatEmailForDisplay = (email: string, showDomain: boolean = true): string => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 3) {
    return showDomain ? email : localPart + '@***';
  }
  
  const visibleChars = Math.max(2, Math.floor(localPart.length / 3));
  const hiddenPart = '*'.repeat(localPart.length - visibleChars);
  const maskedLocal = localPart.slice(0, visibleChars) + hiddenPart;
  
  if (showDomain) {
    return `${maskedLocal}@${domain}`;
  } else {
    return `${maskedLocal}@***`;
  }
};

// ================================================================================================
// UTILIDADES DE TRANSFORMACIÓN
// ================================================================================================

/**
 * Convierte string a número de forma segura
 * @param value - Valor a convertir
 * @param defaultValue - Valor por defecto si falla la conversión
 * @returns Número convertido o valor por defecto
 */
export const safeParseNumber = (value: string | number, defaultValue: number = 0): number => {
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  if (typeof value !== 'string') return defaultValue;
  
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Convierte string a entero de forma segura
 * @param value - Valor a convertir
 * @param defaultValue - Valor por defecto si falla la conversión
 * @returns Entero convertido o valor por defecto
 */
export const safeParseInt = (value: string | number, defaultValue: number = 0): number => {
  if (typeof value === 'number') return Math.floor(isNaN(value) ? defaultValue : value);
  if (typeof value !== 'string') return defaultValue;
  
  const cleaned = value.replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? defaultValue : parsed;
};

// ================================================================================================
// EXPORTACIONES POR DEFECTO
// ================================================================================================

export default {
  // Fechas
  formatDate,
  formatRelativeTime,
  formatDateForInput,
  formatDateTimeForInput,
  
  // Números
  formatNumber,
  formatPercentage,
  formatNumberWithSuffix,
  
  // Moneda
  formatCurrency,
  formatSalary,
  
  // Texto
  capitalize,
  truncateText,
  generateSlug,
  formatName,
  getInitials,
  
  // Archivos
  formatFileSize,
  
  // Específicos de la app
  formatAdminStatus,
  formatAdminRole,
  formatEmailForDisplay,
  
  // Transformaciones
  safeParseNumber,
  safeParseInt
};
