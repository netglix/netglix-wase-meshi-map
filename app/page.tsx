import { RestaurantsApp } from "@/components/restaurants-app";
import { getRestaurants } from "@/lib/restaurants";

const defaultLat = Number(process.env.MAP_CENTER_LAT ?? 35.708);
const defaultLng = Number(process.env.MAP_CENTER_LNG ?? 139.719);
const formUrl =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ??
  "https://docs.google.com/forms/d/e/EXAMPLE/viewform";

export default async function Home() {
  const restaurants = await getRestaurants();

  return (
    <RestaurantsApp
      initialRestaurants={restaurants}
      center={[defaultLat, defaultLng]}
      formUrl={formUrl}
    />
  );
}
