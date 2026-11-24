export type MockCustomerId = 'customer-alex-rivera' | 'customer-maya-patel';

export type MockCustomer = {
  id: MockCustomerId;
  displayName: string;
  neighborhood: string;
};

export const mockCustomers: MockCustomer[] = [
  {
    id: 'customer-alex-rivera',
    displayName: 'Alex Rivera',
    neighborhood: 'North Loop',
  },
  {
    id: 'customer-maya-patel',
    displayName: 'Maya Patel',
    neighborhood: 'Lakeview',
  },
];

export function isMockCustomerId(value: unknown): value is MockCustomerId {
  return mockCustomers.some((customer) => customer.id === value);
}
