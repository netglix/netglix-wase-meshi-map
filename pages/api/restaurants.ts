import type { NextApiRequest, NextApiResponse } from 'next';
import seedData from '../../data/restaurants.json';
import type { Restaurant } from '../../src/types';

type Cache = {
  expiresAt: number;
  data: Restaurant[];
};

let cache: Cache | null = null;
const FIVE_MINUTES = 5 * 60 * 1000;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsvRow(line: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [] as Record<string, string>[];
  }

  const headers = parseCsvRow(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

function toRestaurant(row: Record<string, string>, index: number): Restaurant | null {
  const approved = ['true', '1', 'yes'].includes((row.approved ?? '').toLowerCase());
  if (!approved) {
    return null;
  }

  const lat = Number(row.lat ?? row.latitude);
  const lng = Number(row.lng ?? row.longitude);
  const name = row.name ?? row.store_name;

  if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    id: row.id || `sheet-${index}`,
    name,
    lat,
    lng,
    budget: row.budget || '不明',
    mood: row.mood || '未設定',
    hours: row.hours || '営業時間未設定',
    photo: row.photo,
    comment: row.comment,
    approved: true
  };
}

async function fetchSheetRestaurants() {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (!csvUrl) {
    return [] as Restaurant[];
  }

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`);
  }

  const csv = await response.text();
  const parsed = parseCsv(csv);
  return parsed
    .map((row, index) => toRestaurant(row, index))
    .filter((restaurant): restaurant is Restaurant => restaurant !== null);
}

async function getMergedRestaurants() {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const sheetRestaurants = await fetchSheetRestaurants();
  const byId = new Map<string, Restaurant>();

  (seedData as Restaurant[]).forEach((restaurant) => {
    byId.set(restaurant.id, restaurant);
  });

  sheetRestaurants.forEach((restaurant) => {
    byId.set(restaurant.id, restaurant);
  });

  const merged = Array.from(byId.values());
  cache = {
    data: merged,
    expiresAt: Date.now() + FIVE_MINUTES
  };

  return merged;
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const restaurants = await getMergedRestaurants();
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error('restaurants api error', error);
    res.status(200).json({ restaurants: seedData });
  }
}
