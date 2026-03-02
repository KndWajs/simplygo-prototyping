"use client"

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef } from "react"
import { Coordinates } from "../../../models/domainDtos"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

interface AddressPickerMapProps {
  center: Coordinates
  zoom?: number
  onMapClick: (coords: Coordinates) => void
}

export const AddressPickerMap: React.FC<AddressPickerMapProps> = ({
  center,
  zoom = 13,
  onMapClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.longitude, center.latitude],
      zoom,
      dragRotate: false,
      cooperativeGestures: false
    })
    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right")

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([center.longitude, center.latitude])
      .addTo(map)
    markerRef.current = marker

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat()
      onMapClick({ latitude: lngLat.lat, longitude: lngLat.lng })
    })

    map.on("click", e => {
      const coords: Coordinates = { latitude: e.lngLat.lat, longitude: e.lngLat.lng }
      marker.setLngLat([coords.longitude, coords.latitude])
      onMapClick(coords)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter([center.longitude, center.latitude])
    }
    if (markerRef.current) {
      markerRef.current.setLngLat([center.longitude, center.latitude])
    }
  }, [center.latitude, center.longitude])

  return <div ref={mapContainerRef} style={{ width: "100%", height: "400px" }} />
}
