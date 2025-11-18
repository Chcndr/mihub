// Pagina di simulazione per la dashboard MIO
import React from 'react';
import MIOLogs from '../components/MIOLogs';

export default function MIOPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">MIO: GitHub Logs</h1>
      <MIOLogs />
    </div>
  );
}
