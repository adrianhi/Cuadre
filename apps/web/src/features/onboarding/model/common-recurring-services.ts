export interface CommonService {
  id: string;
  name: string;
  category: string;
  defaultAmount: number;
}

export const COMMON_RD_SERVICES: CommonService[] = [
  { id: 'telecom', name: 'Internet / Telecom (Claro/Altice)', category: 'Servicios', defaultAmount: 2200 },
  { id: 'electricity', name: 'Electricidad (Edeeste/Edesur)', category: 'Servicios', defaultAmount: 3500 },
  { id: 'streaming', name: 'Streaming (Netflix/Spotify)', category: 'Entretenimiento', defaultAmount: 1450 },
  { id: 'gym', name: 'Gimnasio (Smart Fit/Gym)', category: 'Salud', defaultAmount: 1790 },
  { id: 'home', name: 'Alquiler o Mantenimiento', category: 'Hogar', defaultAmount: 15000 },
];
