import { useContext } from 'react';

import { BookingContext, type BookingContextValue } from '../state/bookingContext';

export type UseBookingsResult = BookingContextValue;

export function useBookings(): UseBookingsResult {
  const bookingContext = useContext(BookingContext);

  if (bookingContext === null) {
    throw new Error('useBookings must be used within a BookingProvider.');
  }

  return bookingContext;
}

export default useBookings;
