// Página principal que muestra información del usuario y sus roles para testing

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Componente principal del Dashboard para testing de autenticación y roles
export function Dashboard() {
  // Obtenemos el estado de autenticación y funciones del contexto
  const { authState, logout, isSuperAdmin } = useAuth();
  
  // Desestructuramos los datos del usuario para fácil acceso
  const { user } = authState;

  // Función para manejar el logout
  const handleLogout = async () => {
    try {
      await logout(); // Ejecuta logout del contexto
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  };

  // Si no hay usuario (no debería pasar por las rutas protegidas), mostramos mensaje
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header con saludo y botón de logout */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user.profile.full_name || 'Usuario'}! 👋
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        {/* Card con información del perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
            <CardDescription>
              Datos básicos de tu cuenta en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email del usuario */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{user.profile.email}</p>
            </div>
            
            {/* Nombre completo */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
              <p className="text-lg text-gray-900">
                {user.profile.full_name || 'No especificado'}
              </p>
            </div>
            
            {/* Rol del sistema */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Rol del Sistema</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.profile.role === 'super_admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.profile.role === 'super_admin' ? 'Super Administrador' : 'Admin de Club'}
              </span>
            </div>
            
            {/* Estado de super admin */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Super Administrador</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isSuperAdmin() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isSuperAdmin() ? 'Sí' : 'No'}
              </span>
            </div>
            
            {/* Teléfono si existe */}
            {user.profile.phone && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="text-lg text-gray-900">{user.profile.phone}</p>
              </div>
            )}
            
            {/* Último login si existe */}
            {user.profile.last_login_at && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Último Login</p>
                <p className="text-lg text-gray-900">
                  {new Date(user.profile.last_login_at).toLocaleString('es-ES')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card con información de los clubs */}
        <Card>
          <CardHeader>
            <CardTitle>Clubs Asignados</CardTitle>
            <CardDescription>
              Clubs a los que tienes acceso y tu rol en cada uno
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.clubs.length > 0 ? (
              <div className="space-y-4">
                {user.clubs.map((userClub) => (
                  <div key={userClub.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      {/* Información del club */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userClub.club.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Slug: {userClub.club.slug}
                        </p>
                        {userClub.club.description && (
                          <p className="text-sm text-gray-600">
                            {userClub.club.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Rol en el club */}
                      <div className="text-right space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          userClub.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          userClub.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          userClub.role === 'supervisor' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userClub.role === 'owner' ? 'Propietario' :
                           userClub.role === 'manager' ? 'Gerente' :
                           userClub.role === 'supervisor' ? 'Supervisor' :
                           'Staff'}
                        </span>
                        <p className="text-xs text-gray-500">
                          Desde: {new Date(userClub.joined_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Información adicional del club */}
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Estado:</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          userClub.club.status === 'active' ? 'bg-green-100 text-green-800' :
                          userClub.club.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {userClub.club.status === 'active' ? 'Activo' :
                           userClub.club.status === 'inactive' ? 'Inactivo' :
                           'Suspendido'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Plan:</span>
                        <span className="ml-2 text-gray-900 capitalize">
                          {userClub.club.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mensaje cuando no hay clubs asignados
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🏢</div>
                <p className="text-gray-600">No tienes clubs asignados</p>
                <p className="text-sm text-gray-500 mt-1">
                  Contacta al administrador para obtener acceso a clubs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card con información técnica para debugging */}
        <Card>
          <CardHeader>
            <CardTitle>Información Técnica (Debug)</CardTitle>
            <CardDescription>
              Datos técnicos para verificar el funcionamiento del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* ID del usuario */}
              <div className="space-y-1">
                <p className="font-medium text-gray-500">User ID</p>
                <p className="text-gray-900 font-mono text-xs break-all">
                  {user.user.id}
                </p>
              </div>
              
              {/* Fecha de creación */}
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Cuenta creada</p>
                <p className="text-gray-900">
                  {new Date(user.profile.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              
              {/* Email verificado */}
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Email verificado</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  user.user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.user.email_confirmed_at ? 'Verificado' : 'No verificado'}
                </span>
              </div>
              
              {/* Cantidad de clubs */}
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Clubs asignados</p>
                <p className="text-gray-900">
                  {user.clubs.length} {user.clubs.length === 1 ? 'club' : 'clubs'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
