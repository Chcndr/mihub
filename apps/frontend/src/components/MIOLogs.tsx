import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, Clock, HardDrive } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type LogFile = {
  filename: string;
  timestamp: string;
  content: any;
  size: number;
  modified: string;
};

export default function MIOLogs() {
  const [selectedLog, setSelectedLog] = useState<LogFile | null>(null);

  // Query tRPC per recuperare i log
  const { data: logs = [], isLoading, error } = trpc.mioAgent.getLogs.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Caricamento log...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Errore nel caricamento dei log: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log da GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground">Nessun log disponibile</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: LogFile) => (
                <div
                  key={log.filename}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.filename}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatSize(log.size)}
                        </span>
                      </div>
                      {log.content.message && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {log.content.message}
                        </p>
                      )}
                    </div>
                    {log.content.status && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          log.content.status === 'success'
                            ? 'bg-green-500/10 text-green-500'
                            : log.content.status === 'error'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {log.content.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLog?.filename}</DialogTitle>
            <div className="text-sm text-muted-foreground mt-2">
              {selectedLog && formatTimestamp(selectedLog.timestamp)}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLog?.content && (
              <>
                {selectedLog.content.agent && (
                  <div>
                    <span className="font-semibold">Agente:</span> {selectedLog.content.agent}
                  </div>
                )}
                {selectedLog.content.action && (
                  <div>
                    <span className="font-semibold">Azione:</span> {selectedLog.content.action}
                  </div>
                )}
                {selectedLog.content.message && (
                  <div>
                    <span className="font-semibold">Messaggio:</span> {selectedLog.content.message}
                  </div>
                )}
                {selectedLog.content.details && (
                  <div>
                    <span className="font-semibold">Dettagli:</span>
                    <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.content.details, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <span className="font-semibold">JSON Completo:</span>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.content, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
