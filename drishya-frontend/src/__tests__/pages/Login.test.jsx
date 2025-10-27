import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';

describe('Login Page', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('should render login form with email and password inputs', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should have link to register page', () => {
    renderLogin();
    
    const registerLink = screen.getByRole('link', { name: 'Create one' });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should display form title heading', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('should have password field of type password', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput.type).toBe('password');
  });

  it('should have email field of type email', () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput.type).toBe('email');
  });

  it('should display login subtitle', () => {
    renderLogin();
    
    expect(screen.getByText(/Sign in to your TaskFlow account/i)).toBeInTheDocument();
  });
});
