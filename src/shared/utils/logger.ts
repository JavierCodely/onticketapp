// ================================================================================================
// SISTEMA DE LOGGING CENTRALIZADO Y DETALLADO
// ================================================================================================
// Sistema de logging robusto con múltiples niveles, formateo consistente, y almacenamiento
// en memoria para facilitar el debugging y seguimiento de operaciones críticas en toda la app.
// ================================================================================================

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

/**
 * Niveles de log disponibles en orden de severidad
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

/**
 * Estructura de entrada de log con toda la información necesaria
 */
export interface LogEntry {
  id: string;                      // ID único del log
  timestamp: string;               // Timestamp ISO formateado
  level: LogLevel;                // Nivel del log
  component: string;              // Componente que genera el log
  operation: string;              // Operación específica
  message: string;                // Mensaje descriptivo del log
  data?: any;                     // Datos adicionales opcionales
  error?: Error;                  // Error capturado (si aplica)
  sessionId?: string;             // ID de sesión (opcional)
  userId?: string;                // ID de usuario (opcional)
}

/**
 * Configuración del logger
 */
export interface LoggerConfig {
  maxLogs: number;                // Máximo de logs en memoria
  enableConsole: boolean;         // Si mostrar en consola
  enableStorage: boolean;         // Si guardar en localStorage
  logLevels: LogLevel[];          // Niveles habilitados
  dateFormat: string;             // Formato de fecha
}

/**
 * Filtros para consulta de logs
 */
export interface LogFilters {
  levels?: LogLevel[];            // Filtrar por niveles
  components?: string[];          // Filtrar por componentes
  operations?: string[];          // Filtrar por operaciones
  dateFrom?: Date;                // Fecha desde
  dateTo?: Date;                  // Fecha hasta
  searchTerm?: string;            // Término de búsqueda
}

// ================================================================================================
// CONFIGURACIÓN POR DEFECTO
// ================================================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  maxLogs: 2000,                  // 2000 logs en memoria
  enableConsole: true,            // Mostrar en consola por defecto
  enableStorage: false,           // No guardar en localStorage por defecto
  logLevels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SUCCESS'], // Todos los niveles
  dateFormat: 'HH:mm:ss'          // Formato simple para consola
};

// ================================================================================================
// CLASE PRINCIPAL DEL LOGGER (SINGLETON)
// ================================================================================================

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private config: LoggerConfig;
  private sessionId: string;

  // ============================================================================================
  // CONSTRUCTOR Y SINGLETON
  // ============================================================================================
  
  private constructor(config: Partial<LoggerConfig> = {}) {
    // Combinar configuración por defecto con la proporcionada
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Generar ID de sesión único
    this.sessionId = this.generateSessionId();
    
    // Log inicial del sistema
    this.log('INFO', 'Logger', 'init', 'Sistema de logging inicializado', {
      config: this.config,
      sessionId: this.sessionId
    });
  }

  /**
   * Obtener instancia singleton del logger
   * @param config - Configuración opcional (solo se aplica en primera llamada)
   * @returns Instancia del logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  // ============================================================================================
  // MÉTODOS PRINCIPALES DE LOGGING
  // ============================================================================================
  
  /**
   * Log de nivel DEBUG - Información detallada para desarrollo
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales opcionales
   */
  public debug(component: string, operation: string, message: string, data?: any): void {
    this.log('DEBUG', component, operation, message, data);
  }
  
  /**
   * Log de nivel INFO - Eventos normales importantes
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales opcionales
   */
  public info(component: string, operation: string, message: string, data?: any): void {
    this.log('INFO', component, operation, message, data);
  }
  
  /**
   * Log de nivel WARN - Advertencias que no bloquean la operación
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales opcionales
   */
  public warn(component: string, operation: string, message: string, data?: any): void {
    this.log('WARN', component, operation, message, data);
  }
  
  /**
   * Log de nivel ERROR - Errores que requieren atención
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales opcionales
   */
  public error(component: string, operation: string, message: string, data?: any): void {
    this.log('ERROR', component, operation, message, data);
  }
  
  /**
   * Log de nivel SUCCESS - Operaciones completadas exitosamente
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales opcionales
   */
  public success(component: string, operation: string, message: string, data?: any): void {
    this.log('SUCCESS', component, operation, message, data);
  }

  // ============================================================================================
  // MÉTODOS ESPECIALIZADOS
  // ============================================================================================
  
  /**
   * Log especializado para operaciones de base de datos
   * @param operation - Tipo de operación (select, insert, update, delete)
   * @param table - Tabla afectada
   * @param conditions - Condiciones aplicadas
   * @param result - Resultado de la operación
   */
  public database(
    operation: string, 
    table: string, 
    conditions?: any, 
    result?: any
  ): void {
    const message = `${operation.toUpperCase()} en tabla ${table}`;
    this.info('Database', operation, message, { table, conditions, result });
  }
  
  /**
   * Log especializado para validaciones
   * @param field - Campo validado
   * @param value - Valor validado
   * @param isValid - Si la validación pasó
   * @param errorMessage - Mensaje de error si falló
   */
  public validation(
    field: string, 
    value: any, 
    isValid: boolean, 
    errorMessage?: string
  ): void {
    const level: LogLevel = isValid ? 'SUCCESS' : 'WARN';
    const message = `Validación de ${field}: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`;
    this.log(level, 'Validation', field, message, { 
      field, 
      value, 
      isValid, 
      errorMessage 
    });
  }
  
  /**
   * Log especializado para cambios de estado
   * @param component - Componente afectado
   * @param stateName - Nombre del estado
   * @param oldValue - Valor anterior
   * @param newValue - Nuevo valor
   */
  public stateChange(
    component: string, 
    stateName: string, 
    oldValue: any, 
    newValue: any
  ): void {
    const message = `Estado ${stateName} cambió`;
    this.debug(component, 'state-change', message, { 
      stateName, 
      oldValue, 
      newValue 
    });
  }

  // ============================================================================================
  // MÉTODO INTERNO DE LOGGING
  // ============================================================================================
  
  /**
   * Método interno que procesa y almacena todos los logs
   * @param level - Nivel del log
   * @param component - Componente que genera el log
   * @param operation - Operación específica
   * @param message - Mensaje descriptivo
   * @param data - Datos adicionales
   * @param error - Error capturado
   */
  private log(
    level: LogLevel, 
    component: string, 
    operation: string, 
    message: string, 
    data?: any, 
    error?: Error
  ): void {
    // Verificar si este nivel está habilitado
    if (!this.config.logLevels.includes(level)) {
      return;
    }

    // Crear entrada de log
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      component,
      operation,
      message,
      data,
      error,
      sessionId: this.sessionId
    };

    // Almacenar en memoria (con límite)
    this.addToMemory(logEntry);

    // Mostrar en consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Guardar en localStorage si está habilitado
    if (this.config.enableStorage) {
      this.saveToStorage(logEntry);
    }
  }

  // ============================================================================================
  // GESTIÓN DE ALMACENAMIENTO
  // ============================================================================================
  
  /**
   * Agregar log a la memoria con gestión de límites
   * @param logEntry - Entrada de log a agregar
   */
  private addToMemory(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    
    // Mantener solo los últimos N logs en memoria
    if (this.logs.length > this.config.maxLogs) {
      const excess = this.logs.length - this.config.maxLogs;
      this.logs.splice(0, excess);
    }
  }

  /**
   * Mostrar log en consola con formato y colores
   * @param logEntry - Entrada de log a mostrar
   */
  private logToConsole(logEntry: LogEntry): void {
    const time = new Date(logEntry.timestamp).toLocaleTimeString();
    const prefix = `${this.getLevelEmoji(logEntry.level)} ${logEntry.level}`;
    const component = `[${logEntry.component}]`;
    const operation = `${logEntry.operation}`;
    const message = logEntry.message;

    // Determinar método de consola basado en el nivel
    const consoleMethod = this.getConsoleMethod(logEntry.level);
    
    // Log básico
    consoleMethod(`${prefix} ${time} ${component} ${operation} ${message}`);
    
    // Mostrar datos adicionales si existen
    if (logEntry.data) {
      console.log('📊 Datos:', logEntry.data);
    }
    
    // Mostrar error si existe
    if (logEntry.error) {
      console.error('❌ Error:', logEntry.error);
    }
  }

  /**
   * Guardar log en localStorage (si está habilitado)
   * @param logEntry - Entrada de log a guardar
   */
  private saveToStorage(logEntry: LogEntry): void {
    try {
      const stored = localStorage.getItem('app-logs') || '[]';
      const logs = JSON.parse(stored);
      logs.push(logEntry);
      
      // Mantener solo los últimos 500 logs en localStorage
      if (logs.length > 500) {
        logs.splice(0, logs.length - 500);
      }
      
      localStorage.setItem('app-logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('No se pudieron guardar logs en localStorage:', error);
    }
  }

  // ============================================================================================
  // MÉTODOS DE CONSULTA
  // ============================================================================================
  
  /**
   * Obtener todos los logs almacenados en memoria
   * @param filters - Filtros opcionales para aplicar
   * @returns Array de logs filtrados
   */
  public getLogs(filters?: LogFilters): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      // Filtrar por niveles
      if (filters.levels && filters.levels.length > 0) {
        filteredLogs = filteredLogs.filter(log => filters.levels!.includes(log.level));
      }
      
      // Filtrar por componentes
      if (filters.components && filters.components.length > 0) {
        filteredLogs = filteredLogs.filter(log => filters.components!.includes(log.component));
      }
      
      // Filtrar por operaciones
      if (filters.operations && filters.operations.length > 0) {
        filteredLogs = filteredLogs.filter(log => filters.operations!.includes(log.operation));
      }
      
      // Filtrar por rango de fechas
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= filters.dateFrom!
        );
      }
      
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= filters.dateTo!
        );
      }
      
      // Filtrar por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(term) ||
          log.component.toLowerCase().includes(term) ||
          log.operation.toLowerCase().includes(term)
        );
      }
    }

    return filteredLogs;
  }

  /**
   * Limpiar todos los logs de memoria
   */
  public clearLogs(): void {
    this.logs = [];
    this.info('Logger', 'clear', 'Logs limpiados de memoria');
  }

  /**
   * Obtener estadísticas de los logs
   * @returns Estadísticas de logs por nivel
   */
  public getStats(): Record<LogLevel, number> {
    const stats: Record<LogLevel, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      SUCCESS: 0
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }

  // ============================================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================================
  
  /**
   * Generar ID único para cada log
   * @returns ID único
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generar ID único para la sesión
   * @returns ID de sesión único
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener emoji para el nivel de log
   * @param level - Nivel de log
   * @returns Emoji correspondiente
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    };
    return emojis[level] || '📝';
  }

  /**
   * Obtener método de consola apropiado para el nivel
   * @param level - Nivel de log
   * @returns Función de consola
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'ERROR':
        return console.error;
      case 'WARN':
        return console.warn;
      case 'SUCCESS':
        return console.log;
      case 'INFO':
        return console.info;
      case 'DEBUG':
      default:
        return console.log;
    }
  }
}

// ================================================================================================
// INSTANCIA SINGLETON EXPORTADA
// ================================================================================================

// Crear y exportar instancia singleton del logger
export const log = Logger.getInstance();

// Exportar también la clase para casos especiales
export { Logger };

// ================================================================================================
// UTILIDADES ADICIONALES
// ================================================================================================

/**
 * Función helper para crear un logger con configuración específica
 * @param config - Configuración personalizada
 * @returns Nueva instancia del logger
 */
export const createLogger = (config: Partial<LoggerConfig>): Logger => {
  return Logger.getInstance(config);
};

/**
 * Función helper para formatear logs para export
 * @param logs - Array de logs
 * @returns String formateado para export
 */
export const formatLogsForExport = (logs: LogEntry[]): string => {
  return logs.map(log => {
    const time = new Date(log.timestamp).toLocaleString();
    const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
    const error = log.error ? ` | Error: ${log.error.message}` : '';
    return `[${time}] ${log.level} [${log.component}] ${log.operation}: ${log.message}${data}${error}`;
  }).join('\n');
};

/**
 * Función helper para exportar logs como archivo
 * @param filters - Filtros opcionales
 * @param filename - Nombre del archivo
 */
export const exportLogs = (filters?: LogFilters, filename?: string): void => {
  const logs = log.getLogs(filters);
  const content = formatLogsForExport(logs);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `logs_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
