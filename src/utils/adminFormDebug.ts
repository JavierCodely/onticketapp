// ================================================================================================
// UTILIDADES DE DEBUG ESPECÍFICAS PARA EL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Funciones especializadas para debuggear problemas específicos del formulario de admin
// ================================================================================================

import { log } from './logger';

// ================================================================================================
// CONSTANTES
// ================================================================================================

const DEBUG_COMPONENT = 'AdminFormDebug';

// ================================================================================================
// FUNCIONES DE DEBUG PARA DATOS
// ================================================================================================

/**
 * Debuggea los datos del administrador en edición
 * Verifica que todos los campos necesarios estén presentes
 */
export function debugEditingAdminData(editingAdmin: any) {
  log.info(DEBUG_COMPONENT, 'debug-editing-admin', 'Analizando datos del administrador en edición', {
    editingAdmin
  });
  
  // Verificar campos obligatorios
  const requiredFields = ['id', 'email', 'full_name', 'role', 'status'];
  const missingFields = requiredFields.filter(field => !editingAdmin[field]);
  
  if (missingFields.length > 0) {
    log.warn(DEBUG_COMPONENT, 'missing-fields', 'Campos faltantes en editingAdmin', {
      missingFields,
      availableFields: Object.keys(editingAdmin || {})
    });
  }
  
  // Verificar tipos de datos
  const fieldTypes = {
    id: typeof editingAdmin?.id,
    email: typeof editingAdmin?.email,
    full_name: typeof editingAdmin?.full_name,
    salary: typeof editingAdmin?.salary,
    role: typeof editingAdmin?.role,
    status: typeof editingAdmin?.status
  };
  
  log.debug(DEBUG_COMPONENT, 'field-types', 'Tipos de datos de campos', fieldTypes);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    fieldTypes
  };
}

/**
 * Debuggea los datos del formulario antes del guardado
 * Verifica validaciones y formatos
 */
export function debugFormDataBeforeSave(formData: any, isEditing: boolean) {
  log.info(DEBUG_COMPONENT, 'debug-form-data', 'Analizando datos del formulario antes del guardado', {
    formData: { ...formData, password: formData.password ? '[OCULTO]' : undefined },
    isEditing
  });
  
  const issues: string[] = [];
  
  // Verificar email
  if (!formData.email) {
    issues.push('Email vacío');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    issues.push('Email con formato inválido');
  }
  
  // Verificar nombre
  if (!formData.full_name) {
    issues.push('Nombre vacío');
  } else if (formData.full_name.length < 2) {
    issues.push('Nombre demasiado corto');
  }
  
  // Verificar contraseña
  if (!isEditing && !formData.password) {
    issues.push('Contraseña requerida para nuevo administrador');
  } else if (formData.password && formData.password.length < 8) {
    issues.push('Contraseña demasiado corta');
  }
  
  // Verificar salario
  if (formData.salary) {
    if (isNaN(Number(formData.salary))) {
      issues.push('Salario no es un número válido');
    } else if (Number(formData.salary) < 0) {
      issues.push('Salario no puede ser negativo');
    } else if (Number(formData.salary) > 9999999999999) {
      issues.push('Salario excede el límite máximo');
    }
  }
  
  // Log issues encontrados
  if (issues.length > 0) {
    log.warn(DEBUG_COMPONENT, 'form-validation-issues', 'Problemas encontrados en el formulario', {
      issues,
      formData: { ...formData, password: '[OCULTO]' }
    });
  } else {
    log.success(DEBUG_COMPONENT, 'form-validation-ok', 'Formulario válido para guardado');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Debuggea el resultado de operaciones de base de datos
 * Analiza errores comunes y proporciona sugerencias
 */
export function debugDatabaseResult(operation: string, result: any, context?: any) {
  log.info(DEBUG_COMPONENT, 'debug-db-result', `Analizando resultado de ${operation}`, {
    operation,
    hasError: !!result?.error,
    hasData: !!result?.data,
    context
  });
  
  if (result?.error) {
    const error = result.error;
    
    // Analizar tipos de errores comunes
    let errorCategory = 'unknown';
    let suggestion = 'Revisar logs de Supabase para más detalles';
    
    if (error.code === '22003') {
      errorCategory = 'numeric_overflow';
      suggestion = 'Valor numérico excede el límite de la columna. Verificar tamaño del salario.';
    } else if (error.code === '23505') {
      errorCategory = 'unique_violation';
      suggestion = 'Violación de restricción única. Probablemente email duplicado.';
    } else if (error.code === '23503') {
      errorCategory = 'foreign_key_violation';
      suggestion = 'Violación de clave foránea. Verificar que el club_id existe.';
    } else if (error.message?.includes('permission')) {
      errorCategory = 'permission_denied';
      suggestion = 'Error de permisos. Verificar RLS policies.';
    } else if (error.message?.includes('timeout')) {
      errorCategory = 'timeout';
      suggestion = 'Operación tardó demasiado. Verificar conexión a internet.';
    }
    
    log.error(DEBUG_COMPONENT, 'db-error-analysis', 'Análisis del error de base de datos', {
      errorCategory,
      suggestion,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details
    });
    
    return {
      success: false,
      errorCategory,
      suggestion,
      error
    };
  }
  
  if (!result?.data) {
    log.warn(DEBUG_COMPONENT, 'no-data-returned', 'La operación no retornó datos', {
      operation,
      result
    });
    
    return {
      success: false,
      errorCategory: 'no_data',
      suggestion: 'La operación no retornó datos. Verificar que la operación se ejecutó correctamente.'
    };
  }
  
  log.success(DEBUG_COMPONENT, 'db-operation-success', `Operación ${operation} exitosa`, {
    dataLength: Array.isArray(result.data) ? result.data.length : 1,
    firstItem: Array.isArray(result.data) ? result.data[0] : result.data
  });
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Debuggea el estado del hook useAdminForm
 * Verifica que todos los estados estén en valores esperados
 */
export function debugHookState(hookState: any) {
  log.info(DEBUG_COMPONENT, 'debug-hook-state', 'Analizando estado del hook useAdminForm', {
    formData: { ...hookState.formData, password: hookState.formData?.password ? '[OCULTO]' : undefined },
    isSubmitting: hookState.isSubmitting,
    isFormValid: hookState.isFormValid,
    validationErrors: hookState.realtimeValidation
  });
  
  const issues: string[] = [];
  
  // Verificar estados booleanos
  if (typeof hookState.isSubmitting !== 'boolean') {
    issues.push('isSubmitting no es boolean');
  }
  
  if (typeof hookState.isFormValid !== 'boolean') {
    issues.push('isFormValid no es boolean');
  }
  
  // Verificar que formData tenga la estructura correcta
  if (!hookState.formData || typeof hookState.formData !== 'object') {
    issues.push('formData no es un objeto válido');
  } else {
    const requiredFields = ['email', 'full_name', 'password', 'salary', 'role', 'status', 'selectedClubs'];
    const missingFields = requiredFields.filter(field => !(field in hookState.formData));
    
    if (missingFields.length > 0) {
      issues.push(`Campos faltantes en formData: ${missingFields.join(', ')}`);
    }
  }
  
  if (issues.length > 0) {
    log.error(DEBUG_COMPONENT, 'hook-state-issues', 'Problemas encontrados en el estado del hook', {
      issues
    });
  } else {
    log.success(DEBUG_COMPONENT, 'hook-state-ok', 'Estado del hook es válido');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Función de emergencia para debuggear todo el proceso de edición
 * Úsala cuando no sepas qué está fallando
 */
export function debugFullEditingProcess(editingAdmin: any, formData: any, hookState: any) {
  log.info(DEBUG_COMPONENT, 'full-debug', '🔍 INICIANDO DEBUG COMPLETO DEL PROCESO DE EDICIÓN');
  
  console.log('='.repeat(80));
  console.log('🔍 DEBUG COMPLETO - FORMULARIO DE ADMINISTRADORES');
  console.log('='.repeat(80));
  
  // 1. Debug datos de entrada
  console.log('1️⃣ DATOS DEL ADMINISTRADOR EN EDICIÓN:');
  const editingAnalysis = debugEditingAdminData(editingAdmin);
  console.log('   ✓ Análisis:', editingAnalysis);
  
  // 2. Debug estado del formulario
  console.log('\n2️⃣ DATOS DEL FORMULARIO:');
  const formAnalysis = debugFormDataBeforeSave(formData, !!editingAdmin);
  console.log('   ✓ Análisis:', formAnalysis);
  
  // 3. Debug estado del hook
  console.log('\n3️⃣ ESTADO DEL HOOK:');
  const hookAnalysis = debugHookState(hookState);
  console.log('   ✓ Análisis:', hookAnalysis);
  
  // 4. Resumen general
  console.log('\n4️⃣ RESUMEN:');
  const allValid = editingAnalysis.isValid && formAnalysis.isValid && hookAnalysis.isValid;
  console.log(`   ${allValid ? '✅' : '❌'} Estado general: ${allValid ? 'VÁLIDO' : 'PROBLEMÁTICO'}`);
  
  if (!allValid) {
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
    if (!editingAnalysis.isValid) {
      console.log('   - Datos de edición:', editingAnalysis.missingFields);
    }
    if (!formAnalysis.isValid) {
      console.log('   - Datos del formulario:', formAnalysis.issues);
    }
    if (!hookAnalysis.isValid) {
      console.log('   - Estado del hook:', hookAnalysis.issues);
    }
  }
  
  console.log('='.repeat(80));
  
  return {
    editingAdmin: editingAnalysis,
    formData: formAnalysis,
    hookState: hookAnalysis,
    overall: allValid
  };
}
