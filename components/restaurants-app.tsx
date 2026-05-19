"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { MOODS, type Mood, type Restaurant } from "@/lib/restaurant-schema";

const RestaurantsMap = dynamic(
  () => import("./restaurants-map").then((module) => module.RestaurantsMap),
  { ssr: false },
);

type RestaurantsAppProps = {
  initialRestaurants: Restaurant[];
  center: [number, number];
  formUrl: string;
};

export function RestaurantsApp({
  initialRestaurants,
  center,
  formUrl,
}: RestaurantsAppProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRestaurants[0]?.id ?? null,
  );

  const budgets = useMemo(
    () => Array.from(new Set(initialRestaurants.map((item) => item.budget))),
    [initialRestaurants],
  );

  const filteredRestaurants = useMemo(
    () =>
      initialRestaurants.filter((item) => {
        const moodMatched =
          selectedMood === "all" || item.mood === selectedMood;
        const budgetMatched =
          selectedBudget === "all" || item.budget === selectedBudget;
        return moodMatched && budgetMatched;
      }),
    [initialRestaurants, selectedBudget, selectedMood],
  );

  const selectedRestaurant =
    filteredRestaurants.find((item) => item.id === selectedId) ??
    filteredRestaurants[0] ??
    null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (!selectedRestaurant) return;
    closeButtonRef.current?.focus();
  }, [selectedRestaurant]);

  return (
    <div className="page-root">
      <header className="page-header">
        <div>
          <h1>早稲めしマップ</h1>
          <p>早稲田・高田馬場・西早稲田のごはんメモ</p>
        </div>
        <a
          href={formUrl}
          target="_blank"
          rel="noreferrer"
          className="submit-link"
        >
          投稿する
        </a>
      </header>

      <section className="filters">
        <label>
          予算
          <select
            value={selectedBudget}
            onChange={(event) => setSelectedBudget(event.target.value)}
          >
            <option value="all">すべて</option>
            {budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>
        <label>
          ムード
          <select
            value={selectedMood}
            onChange={(event) => setSelectedMood(event.target.value)}
          >
            <option value="all">すべて</option>
            {MOODS.map((mood: Mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>
      </section>

      <main className="main-layout">
        <div className="map-wrapper">
          <RestaurantsMap
            restaurants={filteredRestaurants}
            selectedId={selectedRestaurant?.id ?? null}
            onSelect={handleSelect}
            center={center}
          />
        </div>
        <aside className="list-wrapper">
          {filteredRestaurants.length === 0 && (
            <p className="empty-state">条件に一致するお店がありません。</p>
          )}
          {filteredRestaurants.map((restaurant) => {
            const isSelected = selectedRestaurant?.id === restaurant.id;
            return (
              <article
                key={restaurant.id}
                className={`restaurant-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(restaurant.id)}
              >
                <img src={restaurant.photo_url} alt={restaurant.name} />
                <div>
                  <h2>{restaurant.name}</h2>
                  <p>予算: {restaurant.budget}</p>
                  <p>営業時間: {restaurant.open_hours}</p>
                  <p>ムード: {restaurant.mood}</p>
                  <p>{restaurant.comment}</p>
                </div>
              </article>
            );
          })}
        </aside>
      </main>

      {selectedRestaurant && (
        <dialog
          open
          className="details-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedRestaurant.name} の詳細`}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            onClick={() => setSelectedId(null)}
          >
            閉じる
          </button>
          <img
            src={selectedRestaurant.photo_url}
            alt={selectedRestaurant.name}
          />
          <h3>{selectedRestaurant.name}</h3>
          <p>営業時間: {selectedRestaurant.open_hours}</p>
          <p>予算: {selectedRestaurant.budget}</p>
          <p>ムード: {selectedRestaurant.mood}</p>
          <p>{selectedRestaurant.comment}</p>
          <small>
            地図座標: {selectedRestaurant.lat.toFixed(5)},{" "}
            {selectedRestaurant.lng.toFixed(5)}
          </small>
        </dialog>
      )}
    </div>
  );
}
