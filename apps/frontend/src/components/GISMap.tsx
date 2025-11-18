import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Layers, ZoomIn, ZoomOut } from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons per stato
const createCustomIcon = (color: string, icon?: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
        ${icon || ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export const MARKER_ICONS = {
  free: createCustomIcon('#10b981', '✓'), // Verde
  occupied: createCustomIcon('#ef4444', '✗'), // Rosso
  reserved: createCustomIcon('#f59e0b', '⏱'), // Giallo
  blocked: createCustomIcon('#6b7280', '🚫'), // Grigio
  maintenance: createCustomIcon('#3b82f6', '🔧'), // Blu
  market: createCustomIcon('#14b8a6', '🏪'),
  bus: createCustomIcon('#3b82f6', '🚌'),
  police: createCustomIcon('#ef4444', '🚨'),
  civic: createCustomIcon('#f59e0b', '🏛️'),
  eco: createCustomIcon('#10b981', '🌱'),
  shop: createCustomIcon('#8b5cf6', '🏬'),
};

export interface GISMarker {
  id: string | number;
  position: [number, number]; // [lat, lng]
  type?: keyof typeof MARKER_ICONS;
  title: string;
  description?: string;
  data?: Record<string, any>;
  onClick?: () => void;
}

export interface GISLayer {
  id: string;
  name: string;
  markers: GISMarker[];
  visible: boolean;
  color?: string;
}

export interface GISOverlay {
  imageUrl: string;
  bounds: [[number, number], [number, number]]; // [[lat1, lng1], [lat2, lng2]]
  opacity?: number;
}

interface GISMapProps {
  center: [number, number];
  zoom?: number;
  markers?: GISMarker[];
  layers?: GISLayer[];
  overlay?: GISOverlay;
  height?: string;
  onMarkerClick?: (marker: GISMarker) => void;
  showControls?: boolean;
  className?: string;
}

// Componente per controlli zoom
function ZoomControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomIn()}
        className="bg-white hover:bg-gray-100"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomOut()}
        className="bg-white hover:bg-gray-100"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function GISMap({
  center,
  zoom = 13,
  markers = [],
  layers = [],
  overlay,
  height = '500px',
  onMarkerClick,
  showControls = true,
  className = '',
}: GISMapProps) {
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    layers.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.visible }), {})
  );
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Combina marker singoli con marker dei layer
  const allMarkers = [
    ...markers,
    ...layers.flatMap(layer =>
      layerVisibility[layer.id] !== false ? layer.markers : []
    ),
  ];

  const handleExportMap = () => {
    if (!mapRef.current) return;
    
    // TODO: Implementare export mappa come PNG
    console.log('Export mappa non ancora implementato');
  };

  const toggleLayer = (layerId: string) => {
    setLayerVisibility(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Layer Control Panel */}
      {showControls && layers.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="bg-white hover:bg-gray-100"
          >
            <Layers className="h-4 w-4 mr-2" />
            Layer ({layers.filter(l => layerVisibility[l.id] !== false).length}/{layers.length})
          </Button>

          {showLayerPanel && (
            <Card className="mt-2 p-3 bg-white shadow-lg max-w-xs">
              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={layer.id}
                      checked={layerVisibility[layer.id] !== false}
                      onCheckedChange={() => toggleLayer(layer.id)}
                    />
                    <label
                      htmlFor={layer.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {layer.name} ({layer.markers.length})
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Export Button */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportMap}
            className="bg-white hover:bg-gray-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      )}

      {/* Mappa */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Overlay PNG (pianta mercato) */}
        {overlay && (
          <ImageOverlay
            url={overlay.imageUrl}
            bounds={overlay.bounds}
            opacity={overlay.opacity || 0.7}
          />
        )}

        {/* Marker */}
        {allMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={marker.type ? MARKER_ICONS[marker.type] : undefined}
            eventHandlers={{
              click: () => {
                if (marker.onClick) marker.onClick();
                if (onMarkerClick) onMarkerClick(marker);
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{marker.title}</h3>
                {marker.description && (
                  <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
                )}
                {marker.data && (
                  <div className="text-sm space-y-1">
                    {Object.entries(marker.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Controlli Zoom */}
        {showControls && <ZoomControls />}
      </MapContainer>
    </div>
  );
}
