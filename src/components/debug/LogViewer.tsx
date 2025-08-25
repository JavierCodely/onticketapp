// ================================================================================================
// VISOR DE LOGS PARA DEBUG
// ================================================================================================
// Componente para visualizar y exportar logs del sistema de forma fácil
// ================================================================================================

import React, { useState, useEffect } from 'react';
import { log } from '@/shared/utils/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateLogs = () => {
      setLogs(log.getLogs());
    };

    updateLogs();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateLogs, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleExportLogs = () => {
    const logText = log.exportLogs();
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'outline';
      case 'success': return 'default';
      case 'info': return 'secondary';
      case 'debug': return 'outline';
      default: return 'secondary';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📝';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔍 Log Viewer - Debug de Administradores</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "⏸️ Pausar" : "▶️ Auto Refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={log.clearLogs}>
              🧹 Limpiar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              💾 Exportar Logs
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Total de logs: {logs.length} | 
          Errores: {logs.filter(l => l.level === 'error').length} | 
          Advertencias: {logs.filter(l => l.level === 'warn').length}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">No hay logs disponibles</p>
          ) : (
            logs.slice(-50).reverse().map((logEntry, index) => (
              <div 
                key={index} 
                className={`p-2 rounded border-l-4 ${
                  logEntry.level === 'error' ? 'border-red-500 bg-red-50' :
                  logEntry.level === 'warn' ? 'border-yellow-500 bg-yellow-50' :
                  logEntry.level === 'success' ? 'border-green-500 bg-green-50' :
                  logEntry.level === 'info' ? 'border-blue-500 bg-blue-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Badge variant={getLevelBadgeVariant(logEntry.level)} className="text-xs">
                    {getLevelEmoji(logEntry.level)} {logEntry.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(logEntry.timestamp).toLocaleTimeString()}</span>
                      <span>[{logEntry.component}]</span>
                      <span>{logEntry.operation}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{logEntry.message}</p>
                    {logEntry.data && (
                      <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded overflow-x-auto">
                        {JSON.stringify(logEntry.data, null, 2)}
                      </pre>
                    )}
                    {logEntry.error && (
                      <div className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded">
                        <strong>Error:</strong> {logEntry.error.message}
                        {logEntry.error.stack && (
                          <details className="mt-1">
                            <summary className="cursor-pointer">Ver stack trace</summary>
                            <pre className="mt-1 text-xs">{logEntry.error.stack}</pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
