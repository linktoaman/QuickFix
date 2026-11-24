import { useContext } from 'react';

import { BookingContext } from '../state/bookingContext';

export function useBookings() {
  const bookingContext = useContext(BookingContext);

  if (bookingContext === null) {
    throw new Error('useBookings must be used within a BookingProvider.');
  }

  return bookingContext;
}

export default useBookings;
