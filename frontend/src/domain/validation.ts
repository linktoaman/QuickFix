import type { BookingFormInput, ValidationError } from '../types/booking';
import { getServiceById, normalizeBookingFormInput } from './booking';

type ValidationOptions = {
  now?: Date;
};

const PHONE_PATTERN = /^[\d\s+()-]+$/;

const REQUIRED_FIELD_MESSAGES: Record<keyof BookingFormInput, string> = {
  service: 'Choose a service.',
  name: 'Enter your name.',
  phone: 'Enter your phone number.',
  address: 'Enter the service address.',
  date: 'Choose an appointment date.',
  time: 'Choose an appointment time.',
};

export function validateBookingInput(
  input: BookingFormInput,
  options: ValidationOptions = {},
): ValidationError[] {
  const normalizedInput = normalizeBookingFormInput(input);
  const errors: ValidationError[] = [];

  addRequiredFieldErrors(normalizedInput, errors);
  addServiceCatalogError(normalizedInput, errors);
  addPhoneFormatError(normalizedInput, errors);
  addAppointmentDateTimeError(normalizedInput, errors, options.now ?? new Date());

  return errors;
}

export function hasValidationErrors(input: BookingFormInput): boolean {
  return validateBookingInput(input).length > 0;
}

function addRequiredFieldErrors(
  input: BookingFormInput,
  errors: ValidationError[],
) {
  Object.entries(REQUIRED_FIELD_MESSAGES).forEach(([field, message]) => {
    const bookingField = field as keyof BookingFormInput;

    if (input[bookingField] === '') {
      errors.push({ field: bookingField, message });
    }
  });
}

function addServiceCatalogError(
  input: BookingFormInput,
  errors: ValidationError[],
) {
  if (input.service === '' || getServiceById(input.service) !== null) {
    return;
  }

  errors.push({
    field: 'service',
    message: 'Choose a service from the QuickFix catalog.',
  });
}

function addPhoneFormatError(
  input: BookingFormInput,
  errors: ValidationError[],
) {
  if (input.phone === '' || PHONE_PATTERN.test(input.phone)) {
    return;
  }

  errors.push({
    field: 'phone',
    message: 'Use only digits, spaces, plus signs, hyphens, and parentheses.',
  });
}

function addAppointmentDateTimeError(
  input: BookingFormInput,
  errors: ValidationError[],
  now: Date,
) {
  if (input.date === '' || input.time === '') {
    return;
  }

  const appointmentDateTime = parseAppointmentDateTime(input.date, input.time);

  if (appointmentDateTime === null) {
    errors.push({
      field: 'date',
      message: 'Choose a valid appointment date and time.',
    });
    return;
  }

  if (appointmentDateTime.getTime() <= now.getTime()) {
    errors.push({
      field: 'date',
      message: 'Choose a future appointment date and time.',
    });
  }
}

function parseAppointmentDateTime(date: string, time: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);

  if (dateMatch === null || timeMatch === null) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const monthIndex = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const parsedDate = new Date(year, monthIndex, day, hours, minutes);

  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== monthIndex
    || parsedDate.getDate() !== day
    || parsedDate.getHours() !== hours
    || parsedDate.getMinutes() !== minutes
  ) {
    return null;
  }

  return parsedDate;
}
