import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside>
      <Link to="/">Dashboard</Link>
      <Link to="/kanban">Kanban Board</Link>
      <Link to="/tasks">Task List</Link>
      {/* Add more as needed */}
    </aside>
  );
}
