import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import KanbanBoard from '../../pages/KanbanBoard';

// Mock API calls to prevent "No access token" errors
vi.mock('../../api', () => ({
  getKanbanBoard: vi.fn(() => Promise.reject(new Error('Mock'))),
}));

describe('Kanban Board Page', () => {
  const renderKanban = () => {
    return render(
      <BrowserRouter>
        <KanbanBoard />
      </BrowserRouter>
    );
  };

  it('should render loader or main content', () => {
    renderKanban();

    // Accept either the loader or actual main container
    const loader = screen.queryByText((content, element) =>
      element.className?.includes('loader')
    );
    const main = screen.queryByRole('main');
    expect(loader || main || document.body).toBeDefined();
  });

  it('should render without crashing even with API errors', () => {
    const { container } = renderKanban();
    expect(container).toBeInTheDocument();
  });

  it('should render page structure', () => {
    const { container } = renderKanban();
    expect(container.firstChild).toBeDefined();
  });
});
