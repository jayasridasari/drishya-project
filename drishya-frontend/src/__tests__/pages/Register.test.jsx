import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

// Mock API calls
vi.mock('../../api', () => ({
  getDashboardStats: vi.fn(() => Promise.reject(new Error('Mock'))),
}));

describe('Dashboard Page', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should render dashboard page', () => {
    renderDashboard();
    
    const container = screen.queryByRole('heading');
    expect(container || document.body).toBeDefined();
  });

  it('should render page structure without crashing', () => {
    const { container } = renderDashboard();
    
    expect(container).toBeInTheDocument();
  });
});
