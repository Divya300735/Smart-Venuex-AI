import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('Login Component', () => {
  it('renders login form properly', () => {
    // Need router and auth contexts to render properly
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Welcome back|Create your account/i)).toBeDefined();
  });

  it('switches between Sign Up and Sign In tabs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    const signInBtn = screen.getByRole('tab', { name: /Switch to Sign In tab/i });
    fireEvent.click(signInBtn);
    expect(screen.getByText(/Welcome back/i)).toBeDefined();
  });
});
