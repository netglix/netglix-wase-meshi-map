import fs from "node:fs/promises";
import path from "node:path";

import Papa from "papaparse";

import {
  MOODS,
  type Mood,
  type RawRestaurant,
  type Restaurant,
} from "./restaurant-schema";

type RestaurantsCache = {
  cacheExpiresAt: number;
  data: Restaurant[];
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const APPROVED_VALUE = "TRUE";
const cache: RestaurantsCache = {
  cacheExpiresAt: 0,
  data: [],
};

const parseMood = (value: string | undefined): Mood => {
  if (!value) return "あっさり";
  return MOODS.includes(value as Mood) ? (value as Mood) : "あっさり";
};

const parseNumber = (value: string | number | undefined): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeRestaurant = (
  row: RawRestaurant,
  source: "seed" | "sheet",
  index: number,
): Restaurant | null => {
  const name = row.name?.trim();
  const lat = parseNumber(row.lat);
  const lng = parseNumber(row.lng);

  if (!name || lat === null || lng === null) {
    return null;
  }

  return {
    id: `${source}-${name}-${lat}-${lng}-${index}`,
    name,
    budget: row.budget?.trim() || "未設定",
    open_hours: row.open_hours?.trim() || "未設定",
    photo_url:
      row.photo_url?.trim() ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    comment: row.comment?.trim() || "コメント募集中です。",
    mood: parseMood(row.mood?.trim()),
    lat,
    lng,
    source,
  };
};

const loadSeedRestaurants = async (): Promise<Restaurant[]> => {
  const filePath = path.join(process.cwd(), "data", "restaurants.json");
  const content = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(content) as RawRestaurant[];

  return data
    .map((row, index) => normalizeRestaurant(row, "seed", index))
    .filter((row): row is Restaurant => row !== null);
};

const loadSheetRestaurants = async (csvUrl: string): Promise<Restaurant[]> => {
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet CSV: ${response.status}`);
  }

  const csv = await response.text();
  const parsed = Papa.parse<RawRestaurant>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .filter((row) => String(row.approved).toUpperCase() === APPROVED_VALUE)
    .map((row, index) => normalizeRestaurant(row, "sheet", index))
    .filter((row): row is Restaurant => row !== null);
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const now = Date.now();
  if (cache.cacheExpiresAt > now) {
    return cache.data;
  }

  const seedRestaurants = await loadSeedRestaurants();
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;

  let restaurants = seedRestaurants;

  if (csvUrl) {
    try {
      const sheetRestaurants = await loadSheetRestaurants(csvUrl);
      restaurants = [...seedRestaurants, ...sheetRestaurants];
    } catch (error) {
      console.error("Failed to load Google Sheet CSV, using seed data.", error);
    }
  }

  cache.cacheExpiresAt = now + CACHE_TTL_MS;
  cache.data = restaurants;

  return restaurants;
};
