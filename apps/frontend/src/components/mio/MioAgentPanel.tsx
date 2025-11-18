// client/src/components/mio/MioAgentPanel.tsx

import React, { useState } from 'react';

const MioAgentPanel: React.FC<{} = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('start');

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const newLogs = [...logs, `TU: ${input}`, `*MIO'*: [Status visualizzato per "${input}"]];
    setLogs(newLogs);
    setInput(');
  };

  return (
    <div className="bg-white shadow rounded p-6 h-full w-full overflow-auto">
      <h2 className="text-xl font-bold mb-4">Pannello MIO Agent</h2>
      <div className="border rounded pt-4 w-full overflow-auto bg-gray-100 mb4">
        {logs.map(log => (
          <div key={log} className="text-sm text-gray-800 mb-1">{log}</div>
        ))
      }
      </div>
      <div className="flex gap-2">
        <input
          className="flex-grow border rounded px-2 py-1"
          value={input}
          onChange= (e) => setInput(e.target.value as string)}
          placeholder="Scrivi un comando per MIO..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={handleSubmit}
        >
          Invia
        </button>
      </div>
    </div>
  );
};

export default MioAgentPanel;
