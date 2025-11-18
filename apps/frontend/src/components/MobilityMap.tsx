import { useEffect, useRef, useState } from 'react';
import { MapView } from './Map';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}



interface MobilityStop {
  id: number;
  type: 'bus' | 'tram' | 'parking';
  stopName: string;
  lineNumber?: string;
  lineName?: string;
  lat: string;
  lng: string;
  nextArrival?: number;
  occupancy?: number;
  status?: string;
  totalSpots?: number;
  availableSpots?: number;
}

interface MobilityMapProps {
  stops: MobilityStop[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onStopClick?: (stop: MobilityStop) => void;
  showDirections?: boolean;
  origin?: string;
  destination?: string;
  onDirectionsCalculated?: (directions: any) => void;
}

export default function MobilityMap({
  stops,
  center = { lat: 42.7606, lng: 11.1133 }, // Grosseto default
  zoom = 13,
  onStopClick,
  showDirections = false,
  origin,
  destination,
  onDirectionsCalculated
}: MobilityMapProps) {
  const [map, setMap] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

  const handleMapReady = (mapInstance: any) => {
    setMap(mapInstance);
    
    // Initialize DirectionsRenderer if needed
    if (showDirections) {
      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#10b981',
          strokeWeight: 4
        }
      });
      setDirectionsRenderer(renderer);
    }
  };

  // Add markers for stops
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    stops.forEach(stop => {
      const position = {
        lat: parseFloat(stop.lat),
        lng: parseFloat(stop.lng)
      };

      // Choose icon based on type
      let icon: any = {
        url: '',
        scaledSize: new window.google.maps.Size(32, 32)
      };

      if (stop.type === 'bus') {
        icon.url = 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
            <rect x="3" y="6" width="18" height="12" rx="2"/>
            <path d="M3 10h18"/>
            <circle cx="8" cy="16" r="1"/>
            <circle cx="16" cy="16" r="1"/>
          </svg>
        `);
      } else if (stop.type === 'tram') {
        icon.url = 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M4 11h16"/>
            <circle cx="9" cy="17" r="1"/>
            <circle cx="15" cy="17" r="1"/>
            <path d="M8 4v3"/>
            <path d="M16 4v3"/>
          </svg>
        `);
      } else if (stop.type === 'parking') {
        icon.url = 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 7h5a3 3 0 0 1 0 6h-5"/>
            <path d="M8 7v10"/>
          </svg>
        `);
      }

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: stop.stopName,
        icon
      });

      // Info window
      const infoContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${stop.stopName}</h3>
          ${stop.lineNumber ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Linee:</strong> ${stop.lineNumber}</p>` : ''}
          ${stop.nextArrival ? `<p style="margin: 4px 0; font-size: 12px; color: #10b981;"><strong>Prossimo arrivo:</strong> ${stop.nextArrival} min</p>` : ''}
          ${stop.occupancy ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Occupazione:</strong> ${stop.occupancy}%</p>` : ''}
          ${stop.totalSpots ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Posti:</strong> ${stop.availableSpots}/${stop.totalSpots}</p>` : ''}
          ${stop.status ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Stato:</strong> <span style="color: ${stop.status === 'active' ? '#10b981' : '#ef4444'}">${stop.status === 'active' ? 'Attivo' : stop.status === 'delayed' ? 'Ritardo' : 'Sospeso'}</span></p>` : ''}
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onStopClick) {
          onStopClick(stop);
        }
      });

      markersRef.current.push(marker);
    });
  }, [map, stops, onStopClick]);

  // Calculate and display directions
  useEffect(() => {
    if (!map || !directionsRenderer || !showDirections || !origin || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.TRAIN],
          routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
        }
      },
      (result: any, status: any) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          if (onDirectionsCalculated) {
            onDirectionsCalculated(result);
          }
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [map, directionsRenderer, showDirections, origin, destination]);

  return (
    <div className="relative w-full h-full">
      <MapView
        onMapReady={handleMapReady}
        center={center}
        zoom={zoom}
        className="w-full h-full"
      />
    </div>
  );
}
