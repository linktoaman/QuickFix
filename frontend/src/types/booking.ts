export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type ServiceId = 'plumbing' | 'electrical' | 'appliance-repair';

export type ServiceCatalogItem = {
  id: ServiceId;
  name: string;
  description: string;
};

export type BookingFormInput = {
  service: string;
  name: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  description?: string;
};

export type BookingFormField = keyof BookingFormInput;

export type ValidationError = {
  field: BookingFormField;
  message: string;
};

export type CreateBookingCommand = BookingFormInput & {
  id: string;
  customerId: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  customerId: string;
  serviceId: ServiceId;
  serviceName: string;
  customerName: string;
  phone: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  description?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};
