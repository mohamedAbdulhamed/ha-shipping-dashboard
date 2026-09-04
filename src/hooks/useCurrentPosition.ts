import { reverseGeocode } from "@/utils/geocoding";
import { useState, useEffect, useCallback } from "react";

interface Position {
  lat: number;
  lng: number;
}

export function useGeocodedPosition(fallback: Position): {
  position: Position;
  loading: boolean;
  positionError?: GeolocationPositionError;
  geocodeError?: Error;
  updatePosition: (position: Position) => void;
  useCurrentUserLocation: () => void;
  locationName: string;
  updateLocationName: (position: Position) => void;
} {
  const [position, setPosition] = useState(fallback);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [positionError, setPositionError] = useState<GeolocationPositionError>();
  const [geocodeError, setGeocodeError] = useState<Error>();

  const updatePosition = useCallback((newPos: Position) => {
    setPosition(newPos);
  }, []);

  const updateLocationName = useCallback(async (newPos: Position) => {
    if (!newPos) return;
    setLoading(true);
    setGeocodeError(undefined);

    try {
      const placeName = await reverseGeocode(newPos.lat, newPos.lng);
      setLocationName(placeName);
    } catch (error) {
      setGeocodeError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Updates both the position and the location name to the current user location if available
  const useCurrentUserLocation = useCallback(() => {
    setLoading(true);
    setPositionError(undefined);
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPosition: Position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(currentPosition);
        updateLocationName(currentPosition);
        setPositionError(undefined);
        setLoading(false);
      },
      (err) => {
        setPosition(fallback);
        setPositionError(err);
        setLoading(false);
      }
    );
  }, [fallback, updateLocationName]);

  // Update location name when position changes
  useEffect(() => {
    updateLocationName(position);
  }, [position, updateLocationName]);

  return {
    position,
    loading,
    positionError,
    geocodeError,
    updatePosition,
    useCurrentUserLocation,
    locationName,
    updateLocationName,
  };
}
