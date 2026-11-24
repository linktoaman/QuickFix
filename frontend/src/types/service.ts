export type ServiceId = 'plumbing' | 'electrician' | 'ac-repair' | 'home-cleaning';

export type ServiceIconKey = 'wrench' | 'bolt' | 'snowflake' | 'sparkles';

export type Service = {
  id: ServiceId;
  name: string;
  description: string;
  price: string;
  iconKey: ServiceIconKey;
};
