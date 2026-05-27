/**
 * Leaflet 地图组件：显示当前搜索地点的标记
 */
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// 修复 Leaflet 默认标记图标在 Vite 中不显示的问题
const markerIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function HazardMap({ position, displayName }) {
  return (
    <div className="map-panel">
      {/* key 变化时地图会重新定位到新坐标 */}
      <MapContainer
        center={position}
        zoom={11}
        scrollWheelZoom
        key={position.toString()}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={markerIcon}>
          <Popup>
            <strong>{displayName}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
