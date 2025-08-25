// ================================================================================================
// COMPONENTE PARA CAMBIAR ENTRE TEMA CLARO Y OSCURO
// ================================================================================================
// Este componente permite alternar entre el tema claro y oscuro de Shadcn
// ================================================================================================

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Verificar el tema inicial al cargar
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    const html = document.documentElement;
    
    if (isDark) {
      // Cambiar a tema claro
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      // Cambiar a tema oscuro
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        Cambiar a tema {isDark ? 'claro' : 'oscuro'}
      </span>
    </Button>
  );
}
