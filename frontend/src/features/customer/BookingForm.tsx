import { useState, type ChangeEvent, type FormEvent } from 'react';

import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Message from '../../components/ui/Message';
import { SERVICE_CATALOG, isServiceId } from '../../domain/booking';
import { validateBookingInput } from '../../domain/validation';
import useBookings from '../../hooks/useBookings';
import type {
  BookingFormField,
  BookingFormInput,
  ValidationError,
} from '../../types/booking';

type BookingFormProps = {
  initialService?: string;
};

type BookingFormMessage = {
  text: string;
  tone: 'success' | 'error';
};

type BookingFieldErrors = Partial<Record<BookingFormField, string>>;

const emptyFormInput: BookingFormInput = {
  service: '',
  name: '',
  phone: '',
  address: '',
  date: '',
  time: '',
  description: '',
};

function getInitialFormInput(initialService?: string): BookingFormInput {
  if (initialService !== undefined && isServiceId(initialService)) {
    return {
      ...emptyFormInput,
      service: initialService,
    };
  }

  return { ...emptyFormInput };
}

function getErrorsByField(errors: ValidationError[]) {
  return errors.reduce<BookingFieldErrors>(
    (errorsByField, error) => ({
      ...errorsByField,
      [error.field]: errorsByField[error.field] ?? error.message,
    }),
    {},
  );
}

function BookingForm({ initialService }: BookingFormProps) {
  const { createBooking } = useBookings();
  const [formInput, setFormInput] = useState<BookingFormInput>(
    () => getInitialFormInput(initialService),
  );
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [message, setMessage] = useState<BookingFormMessage | null>(null);

  function updateField(field: BookingFormField, value: string) {
    setFormInput((currentInput) => ({
      ...currentInput,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => {
      if (currentErrors[field] === undefined) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];

      return nextErrors;
    });
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    updateField(
      event.target.name as BookingFormField,
      event.target.value,
    );
    setMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateBookingInput(formInput);

    if (validationErrors.length > 0) {
      setFieldErrors(getErrorsByField(validationErrors));
      setMessage({
        text: 'Please complete the required booking details.',
        tone: 'error',
      });
      return;
    }

    const result = createBooking(formInput);

    if (!result.ok) {
      setMessage({
        text: result.error,
        tone: 'error',
      });
      return;
    }

    setFormInput({ ...emptyFormInput });
    setFieldErrors({});
    setMessage({
      text: 'Booking created successfully with Pending status.',
      tone: 'success',
    });
  }

  function handleClearForm() {
    setFormInput({ ...emptyFormInput });
    setFieldErrors({});
    setMessage(null);
  }

  return (
    <form className="booking-form" noValidate onSubmit={handleSubmit}>
      {message === null ? null : (
        <Message tone={message.tone} aria-live="polite">
          <p>{message.text}</p>
        </Message>
      )}

      <div className="booking-form__grid">
        <FormField
          error={fieldErrors.service}
          label="Service"
          name="service"
          required
        >
          {(controlProps) => (
            <select
              {...controlProps}
              value={formInput.service}
              onChange={handleInputChange}
            >
              <option value="">Choose a service</option>
              {SERVICE_CATALOG.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          error={fieldErrors.name}
          label="Customer name"
          name="name"
          required
        >
          {(controlProps) => (
            <input
              {...controlProps}
              autoComplete="name"
              type="text"
              value={formInput.name}
              onChange={handleInputChange}
            />
          )}
        </FormField>

        <FormField
          error={fieldErrors.phone}
          hint="Digits, spaces, plus signs, hyphens, and parentheses are accepted."
          label="Phone"
          name="phone"
          required
        >
          {(controlProps) => (
            <input
              {...controlProps}
              autoComplete="tel"
              inputMode="tel"
              type="tel"
              value={formInput.phone}
              onChange={handleInputChange}
            />
          )}
        </FormField>

        <FormField
          error={fieldErrors.address}
          label="Address"
          name="address"
          required
        >
          {(controlProps) => (
            <input
              {...controlProps}
              autoComplete="street-address"
              type="text"
              value={formInput.address}
              onChange={handleInputChange}
            />
          )}
        </FormField>

        <FormField
          error={fieldErrors.date}
          label="Appointment date"
          name="date"
          required
        >
          {(controlProps) => (
            <input
              {...controlProps}
              type="date"
              value={formInput.date}
              onChange={handleInputChange}
            />
          )}
        </FormField>

        <FormField
          error={fieldErrors.time}
          label="Appointment time"
          name="time"
          required
        >
          {(controlProps) => (
            <input
              {...controlProps}
              type="time"
              value={formInput.time}
              onChange={handleInputChange}
            />
          )}
        </FormField>
      </div>

      <FormField
        error={fieldErrors.description}
        hint="Optional notes help the service team prepare."
        label="Problem description"
        name="description"
      >
        {(controlProps) => (
          <textarea
            {...controlProps}
            value={formInput.description ?? ''}
            onChange={handleInputChange}
          />
        )}
      </FormField>

      <div className="booking-form__actions">
        <Button type="submit">Create booking</Button>
        <Button type="button" variant="secondary" onClick={handleClearForm}>
          Clear form
        </Button>
      </div>
    </form>
  );
}

export default BookingForm;
