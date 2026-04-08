import { User, Professional, Service, Client, Appointment, Stats } from "../types";

const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro na requisição");
  }
  return res.json();
};

export const api = {
  login: (credentials: any): Promise<{ success: boolean; user: User }> => 
    fetchApi("/api/login", { method: "POST", body: JSON.stringify(credentials) }),
  
  getProfessionals: (): Promise<Professional[]> => fetchApi("/api/professionals"),
  createProfessional: (data: any) => fetchApi("/api/professionals", { method: "POST", body: JSON.stringify(data) }),
  updateProfessional: (id: number, data: any) => fetchApi(`/api/professionals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProfessional: (id: number) => fetchApi(`/api/professionals/${id}`, { method: "DELETE" }),

  getServices: (): Promise<Service[]> => fetchApi("/api/services"),
  createService: (data: any) => fetchApi("/api/services", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id: number, data: any) => fetchApi(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteService: (id: number) => fetchApi(`/api/services/${id}`, { method: "DELETE" }),

  getClients: (): Promise<Client[]> => fetchApi("/api/clients"),
  createClient: (data: any) => fetchApi("/api/clients", { method: "POST", body: JSON.stringify(data) }),
  updateClient: (id: number, data: any) => fetchApi(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClient: (id: number) => fetchApi(`/api/clients/${id}`, { method: "DELETE" }),

  getAppointments: (): Promise<Appointment[]> => fetchApi("/api/appointments"),
  createAppointment: (data: any) => fetchApi("/api/appointments", { method: "POST", body: JSON.stringify(data) }),
  deleteAppointment: (id: number) => fetchApi(`/api/appointments/${id}`, { method: "DELETE" }),

  getStats: (): Promise<Stats> => fetchApi("/api/stats"),
  publicBooking: (data: any) => fetchApi("/api/public/book", { method: "POST", body: JSON.stringify(data) }),
};
