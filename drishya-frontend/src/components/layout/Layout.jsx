import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="main-layout">
      <Navbar />
      <Sidebar />
      <main><Outlet /></main>
    </div>
  );
}
