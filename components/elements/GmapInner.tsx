"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GmapInner = () => {
    const [mounted, setMounted] = useState(false);
    const mapKeyRef = useRef(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
        if (!hasRenderedRef.current) {
            setMounted(true);
            hasRenderedRef.current = true;
        }
        return () => { setMounted(false); };
    }, []);

    if (!mounted) {
        return (
            <div
                className="markercluster-map"
                style={{ height: "400px", width: "100%", backgroundColor: "#f0f0f0" }}
            />
        );
    }

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <MapContainer
                key={mapKeyRef.current}
                className="markercluster-map"
                center={[51.0, 19.0]}
                zoom={4}
                maxZoom={18}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
            </MapContainer>
        </div>
    );
};

export default GmapInner;
