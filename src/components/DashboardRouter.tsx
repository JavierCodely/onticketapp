// Componente que enruta a los usuarios al dashboard correcto según su rol

import { useAuth } from '@/context/AuthContext';
import { Dashboard } from '@/pages/Dashboard'; // Dashboard de testing/general
import SuperAdminDashboard from '@/pages/super-admin/Dashboard'; // Nuevo Dashboard del super admin
import { Card, CardContent } from '@/components/ui/card';

export function DashboardRouter() {
  console.log('🚀 DashboardRouter ejecutándose...');
  const { authState, isSuperAdmin, isLoading } = useAuth();
  const { user } = authState;
    
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no hay usuario (no debería pasar por las rutas protegidas)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>No se encontró información del usuario.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dirigir al dashboard correspondiente según el rol del usuario
  const isSuper = isSuperAdmin();
  
  // Debug detallado: Log para verificar el rol del usuario
  console.log('=== DEBUG DASHBOARD ROUTER ===');
  console.log('Usuario completo:', user);
  console.log('Perfil:', user.profile);
  console.log('Email:', user.profile.email);
  console.log('is_super_admin flag:', user.profile.is_super_admin);
  console.log('role:', user.profile.role);
  console.log('Función isSuperAdmin() retorna:', isSuper);
  console.log('================================');
  
  if (isSuper) {
    console.log('🔥 REDIRIGIENDO AL SUPER ADMIN DASHBOARD');
    // Super administradores van al nuevo Dashboard de gestión
    return <SuperAdminDashboard />;
  } else {
    console.log('📊 REDIRIGIENDO AL DASHBOARD NORMAL');
    // Administradores de club van al Dashboard general/testing
    // En el futuro, aquí puedes crear dashboards específicos para cada tipo de rol
    return <Dashboard />;
  }
}
