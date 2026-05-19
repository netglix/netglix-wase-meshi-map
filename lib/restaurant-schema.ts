export const MOODS = [
  "デート",
  "男ともだちとがっつり",
  "あっさり",
  "ちょっとだけ",
] as const;

export type Mood = (typeof MOODS)[number];

export type Restaurant = {
  id: string;
  name: string;
  budget: string;
  open_hours: string;
  photo_url: string;
  comment: string;
  mood: Mood;
  lat: number;
  lng: number;
  source: "seed" | "sheet";
};

export type RawRestaurant = {
  name?: string;
  budget?: string;
  open_hours?: string;
  photo_url?: string;
  comment?: string;
  mood?: string;
  lat?: string | number;
  lng?: string | number;
  approved?: string;
};
