import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QRScanner from './QRScanner';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('QRScanner Component', () => {
  it('renders the scanner interface', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <QRScanner />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Ticket Access/i)).toBeDefined();
    
    const simulateButton = screen.getByRole('button', { name: /Simulate scanning a digital ticket/i });
    expect(simulateButton).toBeDefined();
  });
});
