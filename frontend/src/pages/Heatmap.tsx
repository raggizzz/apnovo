import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Heatmap.module.css";
import { AccessibilityControls } from "../components/AccessibilityControls";

// Mock data
const LOCATIONS = [
    { id: 1, lat: -15.7641, lng: -47.8705, intensity: 0.8, name: "Biblioteca Central" },
    { id: 2, lat: -15.7635, lng: -47.8710, intensity: 0.5, name: "Bloco A" },
    { id: 3, lat: -15.7650, lng: -47.8700, intensity: 0.3, name: "Restaurante Universitário" },
    { id: 4, lat: -15.7645, lng: -47.8715, intensity: 0.9, name: "Estacionamento Norte" },
];

export function Heatmap() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");

    const getColor = (intensity: number) => {
        if (intensity > 0.7) return "#ef4444"; // High - Red
        if (intensity > 0.4) return "#eab308"; // Medium - Yellow
        return "#22c55e"; // Low - Green
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerContent}>
                        <div className={styles.logo} onClick={() => navigate("/")}>
                            <div className={styles.logoIcon}></div>
                            UnDF Connect
                        </div>
                        <nav className={styles.nav}>
                            <a href="#" className={styles.navLink} onClick={() => navigate("/")}>Início</a>
                            <a href="#" className={`${styles.navLink} ${styles.active}`}>Mapa de Calor</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container} style={{ height: '100%' }}>
                    <div className={styles.mapWrapper}>
                        <MapContainer
                            center={[-15.7641, -47.8705]}
                            zoom={16}
                            className={styles.mapContainer}
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {LOCATIONS.map(loc => (
                                <CircleMarker
                                    key={loc.id}
                                    center={[loc.lat, loc.lng]}
                                    radius={20 * loc.intensity}
                                    fillColor={getColor(loc.intensity)}
                                    color="transparent"
                                    fillOpacity={0.6}
                                >
                                    <Popup>
                                        <strong>{loc.name}</strong>
                                        <br />
                                        Intensidade: {Math.round(loc.intensity * 100)}%
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>

                        <div className={styles.controls}>
                            <h2>Mapa de Ocorrências</h2>
                            <div className={styles.filterGroup}>
                                <label>Filtrar por Tipo</label>
                                <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="all">Todos os Itens</option>
                                    <option value="lost">Itens Perdidos</option>
                                    <option value="found">Itens Encontrados</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Período</label>
                                <select className={styles.select}>
                                    <option>Últimos 7 dias</option>
                                    <option>Último mês</option>
                                    <option>Este ano</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.legend}>
                            <div className={styles.legendTitle}>Densidade de Ocorrências</div>
                            <div className={styles.gradient}></div>
                            <div className={styles.labels}>
                                <span>Baixa</span>
                                <span>Alta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AccessibilityControls />
        </div>
    );
}
