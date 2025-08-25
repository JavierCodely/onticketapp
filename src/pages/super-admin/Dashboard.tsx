// Dashboard principal del Super Administrador
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminsManagement from './AdminsManagement';
import ClubsManagement from './ClubsManagement';
import LogViewer from '@/components/debug/LogViewer';


const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona administradores del sistema y clubs
          </p>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admins">Administradores</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="debug">🔍 Debug Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <AdminsManagement />
        </TabsContent>

        <TabsContent value="clubs">
          <ClubsManagement />
        </TabsContent>

        <TabsContent value="debug">
          <LogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;