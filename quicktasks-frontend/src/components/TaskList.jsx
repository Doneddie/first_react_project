import { useEffect, useState } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tasks
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/tasks/')
      .then(res => res.json())
      .then(data => setTasks(data))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    if (!title.trim()) return;
    setLoading(true);
    fetch('http://localhost:8000/api/tasks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, is_completed: false })
    })
      .then(res => res.json())
      .then(newTask => {
        setTasks([...tasks, newTask]);
        setTitle('');
      })
      .finally(() => setLoading(false));
  };

  const toggleComplete = (task) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !task.is_completed })
    })
      .then(res => res.json())
      .then(updatedTask => {
        setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
      })
      .finally(() => setLoading(false));
  };

  const deleteTask = (id) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: 'DELETE'
    })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .finally(() => setLoading(false));
  };

  const startEdit = (task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id) => {
    if (!editTitle.trim()) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle })
    })
      .then(res => res.json())
      .then(updated => {
        setTasks(tasks.map(task => (task.id === id ? updated : task)));
        setEditTaskId(null);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">QuickTasks</h2>

      {/* Add new task */}
      <div className="input-group mb-3">
        <input
          className="form-control"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New task"
        />
        <button className="btn btn-primary" onClick={handleAdd}>Add</button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <ul className="list-group">
          {tasks.map(task => (
            <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
              {editTaskId === task.id ? (
                <input
                  className="form-control me-2"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              ) : (
                <span style={{ textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
              )}

              <div className="d-flex align-items-center">
                {editTaskId === task.id ? (
                  <>
                    <button className="btn btn-sm btn-success me-2" onClick={() => saveEdit(task.id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditTaskId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(task)}>Edit</button>
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => toggleComplete(task)}>
                      {task.is_completed ? 'Undo' : 'Done'}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task.id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
