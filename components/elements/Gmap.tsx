"use client";

import dynamic from 'next/dynamic';

const GmapInner = dynamic(
  () => import('./GmapInner'),
  {
    ssr: false,
    loading: () => (
      <div
        className="markercluster-map"
        style={{ height: "400px", width: "100%", backgroundColor: "#f0f0f0" }}
      />
    ),
  }
);

const Gmap = () => <GmapInner />;

export default Gmap;
