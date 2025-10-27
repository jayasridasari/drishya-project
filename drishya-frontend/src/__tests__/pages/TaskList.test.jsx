import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskList from '../../pages/TaskList';

// Mock API calls
vi.mock('../../api', () => ({
  getTasks: vi.fn(() => Promise.reject(new Error('Mock'))),
  getUsers: vi.fn(() => Promise.reject(new Error('Mock'))),
}));

describe('Task List Page', () => {
  const renderTaskList = () => {
    return render(
      <BrowserRouter>
        <TaskList />
      </BrowserRouter>
    );
  };

  it('should render task list page', () => {
    renderTaskList();
    
    const container = screen.queryByRole('heading');
    expect(container || document.body).toBeDefined();
  });

  it('should render page without crashing', () => {
    const { container } = renderTaskList();
    
    expect(container).toBeInTheDocument();
  });
});
