// mobile/src/components/LeafletMap.web.tsx
// Versão Web do LeafletMap: o react-native-webview não roda no navegador, então o mesmo
// mapa Leaflet é renderizado em um <iframe> isolado (sandbox) com ponte via postMessage.
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTileUrl, MAP_ATTRIBUTION } from '../services/mapTiles';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  image?: string;
  title?: string;
  description?: string;
}

interface LeafletMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerPress?: (id: string) => void;
  interactive?: boolean;
}

const DEFAULT_CENTER = { lat: -4.8622, lng: -43.3561 };

// Evita que dados do usuário (títulos, descrições) fechem a tag <script> do iframe
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

let instanceCounter = 0;

export function LeafletMap({
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerPress,
  interactive = true,
}: LeafletMapProps) {
  const { isDark } = useTheme();
  const channelId = useRef(`leaflet-${++instanceCounter}`).current;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Callbacks em ref para não recriar o iframe quando o pai re-renderiza
  const handlers = useRef({ onLocationSelect, onMarkerPress });
  handlers.current = { onLocationSelect, onMarkerPress };

  // Chaves estáveis: o mapa só é recriado quando os dados realmente mudam
  const markersKey = safeJson(markers);
  const centerLat = center.lat;
  const centerLng = center.lng;

  const mapHtml = useMemo(() => {
    const tileUrl = getTileUrl(isDark);
    const bgColor = isDark ? '#333333' : '#f0f0f0';

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: ${bgColor}; }
    #map { height: 100%; width: 100%; background: ${bgColor}; }
    .leaflet-tile-pane { filter: ${isDark ? 'grayscale(1) brightness(2.2) contrast(0.6) invert(10%)' : 'none'}; }
    .leaflet-container { background: ${bgColor} !important; cursor: ${interactive ? 'crosshair' : 'default'}; }
    .custom-pin {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid ${isDark ? '#000' : '#fff'};
      box-shadow: 0 0 10px rgba(0,0,0,0.3); cursor: pointer;
    }
    .leaflet-popup-content-wrapper {
      background: ${isDark ? '#1a1a1a' : '#ffffff'}; color: ${isDark ? '#ffffff' : '#000000'};
      border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .leaflet-popup-content { margin: 0; width: 220px !important; }
    .popup-container { display: flex; flex-direction: column; }
    .popup-image { width: 100%; height: 120px; object-fit: cover; }
    .popup-text { padding: 12px; font-family: Inter, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
    .popup-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .popup-sub { font-size: 11px; color: ${isDark ? '#999' : '#666'}; }
    .leaflet-popup-tip { background: ${isDark ? '#1a1a1a' : '#ffffff'}; }
    .leaflet-popup-close-button { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var CHANNEL = ${safeJson(channelId)};
    function send(payload) {
      payload.channel = CHANNEL;
      window.parent.postMessage(payload, '*');
    }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    var map = L.map('map', {
      zoomControl: ${interactive},
      attributionControl: true,
      dragging: ${interactive},
      touchZoom: ${interactive},
      scrollWheelZoom: ${interactive},
      doubleClickZoom: ${interactive},
      boxZoom: ${interactive}
    }).setView([${centerLat}, ${centerLng}], ${zoom});

    L.tileLayer(${safeJson(tileUrl)}, { maxZoom: 19, attribution: ${safeJson(MAP_ATTRIBUTION)} }).addTo(map);
    map.attributionControl.setPrefix(false);

    var markers = ${markersKey};
    markers.forEach(function (m) {
      var icon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="custom-pin" style="background-color:' + esc(m.color) + '"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);

      if (m.title) {
        var popupHtml = '<div class="popup-container">'
          + (m.image ? '<img src="' + esc(m.image) + '" class="popup-image" onerror="this.style.display=\\'none\\'" />' : '')
          + '<div class="popup-text"><div class="popup-title">' + esc(m.title) + '</div>'
          + '<div class="popup-sub">' + esc(m.description) + '</div></div></div>';
        marker.bindPopup(popupHtml, { maxWidth: 220, className: 'custom-popup' });
        marker.on('mouseover', function () { marker.openPopup(); });
      }

      marker.on('click', function (e) {
        L.DomEvent.stopPropagation(e);
        send({ type: 'onMarkerPress', id: m.id });
      });
    });

    ${interactive ? `
    map.on('click', function (e) {
      send({ type: 'onLocationSelect', lat: e.latlng.lat, lng: e.latlng.lng });
    });` : ''}

    send({ type: 'ready' });
  </script>
</body>
</html>`;
  }, [markersKey, centerLat, centerLng, zoom, interactive, isDark, channelId]);

  // Ponte iframe -> React (aceita apenas mensagens do próprio iframe e do canal desta instância)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { channel?: string; type?: string; lat?: number; lng?: number; id?: string };
      if (!data || data.channel !== channelId) return;
      if (data.type === 'onLocationSelect' && typeof data.lat === 'number' && typeof data.lng === 'number') {
        handlers.current.onLocationSelect?.(data.lat, data.lng);
      }
      if (data.type === 'onMarkerPress' && typeof data.id === 'string') {
        handlers.current.onMarkerPress?.(data.id);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [channelId]);

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        title="Mapa"
        srcDoc={mapHtml}
        sandbox="allow-scripts allow-popups"
        style={iframeStyle}
      />
    </View>
  );
}

const iframeStyle: React.CSSProperties = { border: 0, width: '100%', height: '100%', display: 'block' };

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
});
