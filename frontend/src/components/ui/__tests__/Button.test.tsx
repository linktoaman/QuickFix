import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Button from '../Button';

describe('Button', () => {
  it('renders a primary button with accessible text and safe defaults', () => {
    render(<Button>Book a repair</Button>);

    const button = screen.getByRole('button', { name: 'Book a repair' });

    expect(button).not.toBeNull();
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList.contains('qf-button')).toBe(true);
    expect(button.classList.contains('qf-button--primary')).toBe(true);
  });
});
