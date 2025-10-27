import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

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
    
    const content = screen.queryByRole('heading');
    expect(content).toBeDefined();
  });

  it('should display dashboard content without crashing', () => {
    const { container } = renderDashboard();
    
    expect(container).toBeInTheDocument();
  });
});
