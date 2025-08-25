// Componente para proteger rutas que requieren autenticación

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from './LoginForm';

// Props del componente ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode; // Componentes hijos que se renderizarán si está autenticado
}

// Componente que protege rutas verificando si el usuario está autenticado
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Obtenemos el estado de autenticación del contexto
  const { authState } = useAuth();

  // Si está cargando, mostramos un loading spinner
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* Spinner de loading */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostramos el formulario de login
  if (!authState.user) {
    return <LoginForm />;
  }

  // Si el usuario está autenticado, renderizamos los componentes hijos
  return <>{children}</>;
}
