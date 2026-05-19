export type Restaurant = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  budget: string;
  mood: string;
  hours: string;
  photo?: string;
  comment?: string;
  approved?: boolean;
};
