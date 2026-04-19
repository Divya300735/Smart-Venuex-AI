import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { AuthProvider } from './context/AuthContext';

describe('App Root Component', () => {
  it('renders without crashing', () => {
    // The App component might need the AuthProvider context if mock routing is used
    render(
      <AuthProvider>
          <App />
      </AuthProvider>
    );
    // As the default route is typically a login or loading screen, we test for its presence implicitly by it not throwing errors.
    expect(document.body).toBeDefined();
  });
});
