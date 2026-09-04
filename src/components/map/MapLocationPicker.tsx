import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import L from "leaflet";
// import axios from "axios";
import { useToast } from "@/hooks/useToast";

// Helper to fix marker icon issue
import "leaflet-defaulticon-compatibility";
import "leaflet/dist/leaflet.css";
import { useGeocodedPosition } from "@/hooks/useCurrentPosition";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapLocationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
  mapZoom?: number;
  scrollWheelZoom?: boolean;
}

const MAP_ZOOM = 10;

// does it need to be memoized?
const MapClickHandler = ({
  onMapClick,
}: {
  onMapClick: (coordinates: Coordinates) => Promise<void>;
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  open,
  onClose,
  onSelectLocation,
  mapZoom = MAP_ZOOM,
  scrollWheelZoom = true,
}) => {
  const defaultCairo = useMemo(() => ({ lat: 30.0444, lng: 31.2357 }), []);

  const {
    position: selectedLocation,
    loading: locationLoading,
    positionError,
    updatePosition,
    useCurrentUserLocation,
    locationName,
  } = useGeocodedPosition(defaultCairo);
  const { showToast } = useToast();

  useEffect(() => {
    if (positionError) {
      if (positionError.code === positionError.PERMISSION_DENIED) {
        showToast(
          "عذراً، لم يتم منح إذن الوصول إلى الموقع. يرجى السماح بالوصول إلى الموقع.",
          { type: "error" }
        );
      } else {
        showToast(
          "عذراً، لم نتمكن من الحصول على موقعك الحالي. سيتم استخدام القاهرة كافتراضي.",
          { type: "warning" }
        );
      }
    }
  }, [positionError, showToast, defaultCairo]);

  const handleMapClick = async (latlng: Coordinates) => {
    updatePosition(latlng);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation({
        name: locationName,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      });
      onClose();
    }
  };

  const MapPlaceholder = useMemo(
    () => (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="textSecondary">
          جاري تحميل الخريطة...
        </Typography>
      </Box>
    ),
    []
  );

  const markerIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: 2, backgroundColor: "#f5f5f5" }}
      >
        <DialogTitle>الموقع المحدد من الخريطة</DialogTitle>
        <Button onClick={useCurrentUserLocation} variant="outlined">
          استخدام موقعي الحالي
        </Button>
      </Stack>
      <DialogContent>
        <MapContainer
          center={selectedLocation}
          zoom={mapZoom}
          scrollWheelZoom={scrollWheelZoom}
          style={{ height: "400px", width: "100%" }}
          placeholder={MapPlaceholder}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedLocation && (
            <Marker position={selectedLocation} icon={markerIcon}>
              <Popup>
                <Typography variant="body2" style={{ textAlign: "center" }}>
                  {locationName || "الموقع المحدد"}
                </Typography>
              </Popup>
            </Marker>
          )}
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
        {/* Display the name of the selected location */}
        {locationName && (
          <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
            الموقع المحدد: {locationName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>الغاء</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!selectedLocation || locationLoading}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapLocationPicker;
