import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { Restaurant } from '../src/types';

const DynamicMap = dynamic(() => import('../src/Map'), { ssr: false });

const DEFAULT_FORM_URL = 'https://forms.gle/hELpM4ZsWbsfdEdU7';
const MAP_CENTER: [number, number] = [
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 35.7075),
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? 139.7211)
];

type ApiResponse = {
  restaurants: Restaurant[];
};

export default function HomePage({ restaurants }: ApiResponse) {
  const [selectedId, setSelectedId] = useState<string | undefined>(restaurants[0]?.id);
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('all');

  const budgetOptions = useMemo(
    () => ['all', ...new Set(restaurants.map((restaurant) => restaurant.budget))],
    [restaurants]
  );
  const moodOptions = useMemo(
    () => ['all', ...new Set(restaurants.map((restaurant) => restaurant.mood))],
    [restaurants]
  );

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const budgetPass = budgetFilter === 'all' || restaurant.budget === budgetFilter;
        const moodPass = moodFilter === 'all' || restaurant.mood === moodFilter;
        return budgetPass && moodPass;
      }),
    [budgetFilter, moodFilter, restaurants]
  );

  const selected = filteredRestaurants.find((restaurant) => restaurant.id === selectedId) ?? filteredRestaurants[0];
  const mapCenter: [number, number] = selected ? [selected.lat, selected.lng] : MAP_CENTER;

  return (
    <>
      <Head>
        <title>WaseMeshi Map</title>
      </Head>
      <main className="layout">
        <header className="header">
          <div>
            <h1>WaseMeshi Map (MVP)</h1>
            <p>早稲田周辺のごはん屋を地図でチェック</p>
          </div>
          <a
            className="postLink"
            href={process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ?? DEFAULT_FORM_URL}
            target="_blank"
            rel="noreferrer"
          >
            投稿する
          </a>
        </header>

        <section className="filters">
          <label>
            予算
            <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'すべて' : option}
                </option>
              ))}
            </select>
          </label>
          <label>
            ムード
            <select value={moodFilter} onChange={(event) => setMoodFilter(event.target.value)}>
              {moodOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'すべて' : option}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="content">
          <div className="mapPane">
            <DynamicMap
              restaurants={filteredRestaurants}
              selectedId={selected?.id}
              center={mapCenter}
              onSelect={setSelectedId}
            />
          </div>
          <aside className="listPane">
            <h2>お店一覧 ({filteredRestaurants.length})</h2>
            <ul>
              {filteredRestaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <button
                    className={`restaurantButton ${selected?.id === restaurant.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => setSelectedId(restaurant.id)}
                  >
                    <strong>{restaurant.name}</strong>
                    <span>
                      {restaurant.budget} / {restaurant.mood}
                    </span>
                    <span>{restaurant.hours}</span>
                    {restaurant.comment ? <small>{restaurant.comment}</small> : null}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const protocol = process.env.VERCEL_URL ? 'https' : 'http';
  const host = process.env.VERCEL_URL ?? 'localhost:3000';
  const response = await fetch(`${protocol}://${host}/api/restaurants`);
  const json = (await response.json()) as ApiResponse;

  return {
    props: {
      restaurants: json.restaurants
    }
  };
}
