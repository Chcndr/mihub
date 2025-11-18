import React, { useState, useEffect } from 'react';
interface Task {
  id: string;
  title: string;
  project: string;
  type: string;
  status: string;
}

const MIOAgent = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/github/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    };
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>😀 MIO Agent - Task Tracker</h1>
      {tasks.length === 0 ? (
        <p>Nessun task fovrato</p>
      ) : (
        <table style={ { width: '100%', marginTop: '1rem', borderCollapse: 'collapse' } }>
          <thead>
            <tr style={ { background: '#222', color: '#fff' } }>
              <th>ID</th>
              <th>Title</th>
              <th>Project</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={ { background: '#111', color: '#ccc' } }>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.project}</td>
                <td>{task.type}</td>
                <td>{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MIOAgent;