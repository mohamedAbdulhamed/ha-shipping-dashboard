import axios from "axios";

const REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocode(
  lat: number,
  lng: number,
  lang = "ar"
): Promise<string> {
  const { data } = await axios.get(REVERSE_GEOCODE_URL, {
    params: { format: "jsonv2", lat, lon: lng, "accept-language": lang },
  });
  return data.display_name || "";
}
