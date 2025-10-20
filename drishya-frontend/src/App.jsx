import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { initializeAuth } from './utils/auth';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import TeamManagement from './pages/TeamManagement';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  useEffect(() => {
    // Initialize auth on app start
    initializeAuth();
  }, []);

  return (
    <UserProvider>
    <BrowserRouter>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/teams" element={<TeamManagement />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}

export default App;
