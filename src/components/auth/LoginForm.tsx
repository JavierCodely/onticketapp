// Formulario de login usando Shadcn UI components y autenticación con Supabase

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Componente principal del formulario de login
export function LoginForm() {
  // Estado para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para manejar el loading durante el login
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtenemos las funciones de autenticación del contexto
  const { login, authState } = useAuth();

  // Función que maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento default del form
    
    // Validación básica de campos requeridos
    if (!email || !password) {
      return;
    }

    setIsLoading(true); // Activamos el estado de loading

    try {
      // Intentamos hacer login usando el contexto de autenticación
      const result = await login({ email, password });
      
      if (!result.success) {
        // Si el login falla, el error se maneja en el contexto
        console.error('Error en login:', result.error);
      }
      // Si es exitoso, la redirección se maneja automáticamente por el contexto
    } catch (error) {
      console.error('Error inesperado en login:', error);
    } finally {
      setIsLoading(false); // Desactivamos el loading al finalizar
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Campo de email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Actualiza el estado del email
                  required // Campo requerido
                  disabled={isLoading} // Deshabilita durante loading
                  className="w-full"
                />
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de la contraseña
                  required // Campo requerido
                  disabled={isLoading} // Deshabilita durante loading
                  className="w-full"
                />
              </div>

              {/* Mostrar error si existe */}
              {authState.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">{authState.error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              {/* Botón de submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password} // Deshabilita si falta datos o está loading
              >
                {isLoading ? (
                  // Texto durante loading
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  // Texto normal
                  'Iniciar Sesión'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Nota sobre el registro */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
