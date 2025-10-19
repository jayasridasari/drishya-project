import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import TeamManagement from './pages/TeamManagement';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
// ...Other pages

function App() {
  return (
    <BrowserRouter>
      {/* Navbar, Sidebar, Notifications, etc. go here */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/teams" element={<TeamManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
