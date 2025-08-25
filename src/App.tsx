// Aplicación principal que integra autenticación y rutas protegidas

import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardRouter } from '@/components/DashboardRouter';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from "@/components/ui/theme-provider"
// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

        <AuthProvider>
          {/* Ruta protegida que requiere autenticación para acceder al Dashboard */}
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
          {/* Componente de notificaciones toasts */}
          <Toaster />
        </AuthProvider>
    </ThemeProvider>
    // Proveedor del contexto de autenticación que envuelve toda la app
  );
}

export default App;