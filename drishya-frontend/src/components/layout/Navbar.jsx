import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/kanban">Kanban</Link>
      <Link to="/tasks">Tasks</Link>
      <Link to="/teams">Teams</Link>
      <Link to="/users">Users</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
