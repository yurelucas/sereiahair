export interface User {
  id: number;
  username: string;
}

export interface Professional {
  id: number;
  name: string;
  photo?: string;
  services: number[]; // IDs of services
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  notes?: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  professionalId: number;
  serviceId: number;
  date: string;
  time: string;
  clientName?: string;
  professionalName?: string;
  serviceName?: string;
  serviceDuration?: number;
}

export interface Stats {
  appointmentsToday: number;
  totalProfessionals: number;
  upcomingBookings: number;
}
