'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Container, Typography,Input } from '@mui/material';
import L from 'leaflet';
import { fetchAvailableMaps, uploadMap } from '@/app/apis/geotiffApis';
import { useRouter } from 'next/compat/router';

const GeotiffVisualiser = () => {
  const [legendUrl, setLegendUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [layerControl, setLayerControl]=useState(null);
  const router = useRouter();
  const token = sessionStorage.getItem('token');
  
  useEffect(() => {
    if (!mapRef.current) {

      const cartoDB = L.tileLayer( 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        minZoom: 2,
        continuousWorld: true,
      })

      var basemaps = {"CartoDB Positron": cartoDB}
      mapRef.current = L.map('map', {
        center: [48.20849, 16.37208], 
        zoom: 4, 
        minZoom: 2,
        maxZoom: 4,
        maxBounds:[[-90,-180],[90,180]],
        worldCopyJump: true,
        layers:[cartoDB]
      });
      setLayerControl(L.control.layers(basemaps, null, {collapsed: false}).addTo(mapRef.current));
    }
  }, []);

  useEffect(()=>{
    if(mapRef && mapRef.current && layerControl){
      async function fetchMaps(){
        const layers = await fetchAvailableMaps();
        if (layers === 401) {
          router.push('/login');
        }
        if(layers && layers.maps){
          layers.maps.map(layer=>{
            const tileLayer = L.tileLayer(`${process.env.NEXT_PUBLIC_API_BASE_URL}${layer.url}/{z}/{x}/{y}.png?token=${token}`, {
              tms: 1, 
              maxZoom: 4,
              minZoom: 2,
              attribution: ""
            })
            layerControl.addOverlay(tileLayer, layer.name);
          })
        }

      }
      fetchMaps();
    }
  },[mapRef, layerControl])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true); 
    setLegendUrl(null); 

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadMap(formData);
      if (data === 401) {
        router.push('/login');
      }
      const tileLayer = L.tileLayer(`${process.env.NEXT_PUBLIC_API_BASE_URL}${data.map_url}/{z}/{x}/{y}.png`, {
        tms: 1, 
        maxZoom: 4,
        minZoom: 2,
        attribution: ""
      })
      layerControl.addOverlay(tileLayer, data.map_name);
    } catch (error) {
      console.error("Error processing GeoTIFF:", error);
      alert("Failed to process the GeoTIFF file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Input type="file" accept=".tif,.tiff" onChange={handleFileUpload} />
      <Container>
        {loading && <Typography>Processing your file...</Typography>}
      </Container>
      <Container style={{ marginTop: '20px' }}>
        <Container id="map" style={{ height: '80vh', width: '100%', marginTop: '20px' }}></Container>
      </Container>
    </Container>
  );
};

export default GeotiffVisualiser;