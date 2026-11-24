import { describe, expect, it } from 'vitest';

import { validateBookingInput } from '../validation';
import type { BookingFormInput } from '../../types/booking';

const validBookingInput: BookingFormInput = {
  service: 'plumbing',
  name: 'Alex Rivera',
  phone: '+1 (555) 010-0123',
  address: '123 Maple Street',
  date: '2099-01-15',
  time: '10:30',
  description: 'Kitchen sink is leaking.',
};

describe('validateBookingInput', () => {
  it('returns required-field errors for missing booking details', () => {
    const errors = validateBookingInput({
      service: '',
      name: ' ',
      phone: '',
      address: '',
      date: '',
      time: '',
      description: '',
    });

    expect(errors).toEqual([
      { field: 'service', message: 'Choose a service.' },
      { field: 'name', message: 'Enter your name.' },
      { field: 'phone', message: 'Enter your phone number.' },
      { field: 'address', message: 'Enter the service address.' },
      { field: 'date', message: 'Choose an appointment date.' },
      { field: 'time', message: 'Choose an appointment time.' },
    ]);
  });

  it('requires appointments to be in the future', () => {
    const errors = validateBookingInput(
      {
        ...validBookingInput,
        date: '2026-01-15',
        time: '08:00',
      },
      { now: new Date(2026, 0, 15, 8, 0) },
    );

    expect(errors).toContainEqual({
      field: 'date',
      message: 'Choose a future appointment date and time.',
    });
  });

  it('accepts a valid future appointment', () => {
    const errors = validateBookingInput(
      {
        ...validBookingInput,
        date: '2026-01-15',
        time: '08:01',
      },
      { now: new Date(2026, 0, 15, 8, 0) },
    );

    expect(errors).toEqual([]);
  });

  it('rejects unsupported phone characters', () => {
    const errors = validateBookingInput({
      ...validBookingInput,
      phone: '555.010.0123 ext abc',
    });

    expect(errors).toContainEqual({
      field: 'phone',
      message: 'Use only digits, spaces, plus signs, hyphens, and parentheses.',
    });
  });

  it('rejects services outside the catalog', () => {
    const errors = validateBookingInput({
      ...validBookingInput,
      service: 'painting',
    });

    expect(errors).toContainEqual({
      field: 'service',
      message: 'Choose a service from the QuickFix catalog.',
    });
  });
});
