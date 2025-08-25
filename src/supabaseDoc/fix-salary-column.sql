-- ================================================================================================
-- FIX PARA COLUMNA SALARY - AUMENTAR PRECISIÓN
-- ================================================================================================
-- Este script corrige el problema de "numeric field overflow" en la columna salary
-- de la tabla administradores, aumentando la precisión de DECIMAL(10,2) a DECIMAL(15,2)
-- ================================================================================================

-- Cambiar la columna salary para permitir valores más grandes
ALTER TABLE administradores 
ALTER COLUMN salary TYPE DECIMAL(15,2);

-- Verificar el cambio
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'administradores' 
AND column_name = 'salary';

-- También actualizar la tabla empleados por consistencia
ALTER TABLE empleados 
ALTER COLUMN hourly_rate TYPE DECIMAL(15,2);

ALTER TABLE empleados 
ALTER COLUMN monthly_salary TYPE DECIMAL(15,2);

-- Verificar cambios en empleados
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'empleados' 
AND column_name IN ('hourly_rate', 'monthly_salary');

/*
RESULTADO ESPERADO:
- administradores.salary: DECIMAL(15,2) - permite hasta 13 dígitos enteros + 2 decimales
- empleados.hourly_rate: DECIMAL(15,2)
- empleados.monthly_salary: DECIMAL(15,2)

Máximo valor: 9,999,999,999,999.99 (casi 10 billones)
*/
