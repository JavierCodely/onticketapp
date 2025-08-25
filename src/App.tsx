// Aplicación principal que integra autenticación y rutas protegidas


import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';

// Componente principal de la aplicación
function App() {
  return (
    // Proveedor del contexto de autenticación que envuelve toda la app
    <AuthProvider>
      {/* Ruta protegida que requiere autenticación para acceder al Dashboard */}
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;