"use client"

import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt"
import MapIcon from "@mui/icons-material/Map"
import mapboxgl, { Marker } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import ReactDOMServer from "react-dom/server"
import LocationPinIcon from "@mui/icons-material/LocationPin"
import { LinearProgress } from "@mui/material"
import { ActivityType, Coordinates, QueryActivityDto } from "../../models/domainDtos"
import { getCategory, isPlaceActivity } from "../../utils/activityUtils"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

export interface MapViewport {
  center: Coordinates
  zoom: number
}

export interface MapProps {
  center: Coordinates
  items?: QueryActivityDto[]
  zoomLevel?: number
  singleItem?: { name: string; coordinates: Coordinates }
  onClick?: (id: string) => void
  onAnywhereClick?: () => void
  selectedItemId?: string | null
  cooperativeGestures?: boolean
  setBounds?: (southWest: Coordinates, northEast: Coordinates) => void
  hideFullscreenControl?: boolean
  onViewportChange?: (viewport: MapViewport) => void
}

interface MapItem {
  name: string
  coordinates: Coordinates
  item?: QueryActivityDto
  category: ActivityType
}

function toMapItems(activities: QueryActivityDto[]): MapItem[] {
  return activities
    .filter(a => a.base.title && a.base.address.coordinates)
    .map(a => ({
      name: a.base.title ?? "Brak nazwy",
      coordinates: a.base.address.coordinates as Coordinates,
      item: a,
      category: getCategory(a)
    }))
}

function spreadOverlappingPoints(items: MapItem[]): MapItem[] {
  const grouped: Record<string, MapItem[]> = {}
  items.forEach(item => {
    const key = `${item.coordinates.latitude.toFixed(5)}_${item.coordinates.longitude.toFixed(5)}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  })

  const spread: MapItem[] = []
  Object.values(grouped).forEach(group => {
    if (group.length === 1) {
      spread.push(group[0])
    } else {
      const angleStep = (2 * Math.PI) / group.length
      const radius = 0.00015
      group.forEach((item, idx) => {
        spread.push({
          ...item,
          coordinates: {
            latitude: item.coordinates.latitude + Math.sin(angleStep * idx) * radius,
            longitude: item.coordinates.longitude + Math.cos(angleStep * idx) * radius
          }
        })
      })
    }
  })
  return spread
}

function getCustomMarkerElement(): HTMLElement {
  const el = document.createElement("div")
  el.style.position = "relative"
  el.style.width = "70px"
  el.style.height = "60px"
  el.style.display = "flex"
  el.style.justifyContent = "center"
  el.style.alignItems = "flex-start"
  el.style.pointerEvents = "auto"

  el.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <>
      <div
        style={{
          position: "absolute",
          bottom: "6px",
          width: "26px",
          height: "8px",
          background: "rgba(0, 0, 0, 0.35)",
          borderRadius: "50%",
          filter: "blur(3px)",
          transform: "scaleX(1.4)"
        }}
      />
      <div
        style={{
          position: "relative",
          transform: "translateY(-1px)",
          height: "48px",
          width: "48px",
          borderRadius: "50%"
        }}
      >
        <LocationPinIcon
          fontSize="large"
          htmlColor="#ff6b35"
          style={{ color: "#ff6b35", fill: "#ff6b35" }}
        />
      </div>
    </>
  )

  return el
}

export const Map = ({
  center,
  items,
  zoomLevel = 11,
  singleItem,
  onClick,
  onAnywhereClick,
  selectedItemId,
  cooperativeGestures = true,
  setBounds,
  hideFullscreenControl,
  onViewportChange
}: MapProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Marker[]>([])
  const geojsonRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSatellite, setIsSatellite] = useState(false)

  const STREETS_STYLE = "mapbox://styles/mapbox/streets-v12"
  const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"

  const toggleSatellite = useCallback(() => {
    if (!mapRef.current) return
    const next = !isSatellite
    setIsSatellite(next)
    mapRef.current.setStyle(next ? SATELLITE_STYLE : STREETS_STYLE)
  }, [isSatellite])

  const setBoundsRef = useRef<MapProps["setBounds"]>(null)
  useEffect(() => {
    setBoundsRef.current = setBounds
  }, [setBounds])

  const onViewportChangeRef = useRef<MapProps["onViewportChange"]>(null)
  useEffect(() => {
    onViewportChangeRef.current = onViewportChange
  }, [onViewportChange])

  type B = { sw: Coordinates; ne: Coordinates }
  const prevBoundsRef = useRef<B | null>(null)

  const boundsChanged = (a: B | null, b: B, eps = 1e-5) => {
    if (!a) return true
    const d = (x: number, y: number) => Math.abs(x - y) > eps
    return (
      d(a.sw.latitude, b.sw.latitude) ||
      d(a.sw.longitude, b.sw.longitude) ||
      d(a.ne.latitude, b.ne.latitude) ||
      d(a.ne.longitude, b.ne.longitude)
    )
  }

  const updateSelectedIcon = (id: string | null) => {
    startTransition(() => {
      if (!mapRef.current) return
      const source = mapRef.current.getSource("activities") as mapboxgl.GeoJSONSource
      if (!source || !geojsonRef.current || !geojsonRef.current.features) return

      const newFeatures = geojsonRef.current.features.map(f => {
        const props = (f.properties || {}) as Record<string, string>
        return {
          ...f,
          properties: {
            ...props,
            icon:
              id && props.id === id
                ? props.originalIcon.substring(0, props.originalIcon.length - 3) + "_2"
                : props.originalIcon || props.icon
          }
        }
      })

      const newData = { ...geojsonRef.current, features: newFeatures }
      geojsonRef.current = newData
      source.setData(newData)
    })
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.longitude, center.latitude],
      zoom: zoomLevel,
      dragRotate: false,
      cooperativeGestures,
      logoPosition: "bottom-right",
      locale: {
        "ScrollZoomBlocker.CtrlMessage": "Użyj Ctrl + przewijanie, aby przybliżyć mapę",
        "ScrollZoomBlocker.CmdMessage": "Użyj ⌘ + przewijanie, aby przybliżyć mapę",
        "TouchPanBlocker.Message": "Użyj dwóch palców, aby przesunąć mapę"
      }
    })
    mapRef.current = map

    if (!hideFullscreenControl) {
      map.addControl(new mapboxgl.FullscreenControl())
    }
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right")

    // Hide default POI labels
    map.on("styledata", () => {
      const style = map.getStyle()
      style.layers
        ?.filter(l => l.id.includes("poi") || l.id.includes("poi-label"))
        .forEach(l => map.setLayoutProperty(l.id, "visibility", "none"))
    })

    const icons: [string, string, number][] = [
      ["/sport_ico_pl.png", ActivityType.Sport + "_pl", 1],
      ["/kids_ico_pl.png", ActivityType.Kids + "_pl", 1],
      ["/event_ico_pl.png", ActivityType.Event + "_pl", 1],
      ["/sport_ico_ev.png", ActivityType.Sport + "_ev", 1],
      ["/kids_ico_ev.png", ActivityType.Kids + "_ev", 1],
      ["/event_ico_ev.png", ActivityType.Event + "_ev", 1],
      ["/sport_ico_2.png", ActivityType.Sport + "_2", 0.8],
      ["/kids_ico_2.png", ActivityType.Kids + "_2", 0.8],
      ["/event_ico_2.png", ActivityType.Event + "_2", 0.8]
    ]

    const setupSourceAndLayers = (m: mapboxgl.Map) => {
      icons.forEach(([url, name, ratio]) => {
        m.loadImage(url, (err, img) => {
          if (err || !img || !m.getStyle()) return
          if (!m.hasImage(name)) {
            m.addImage(name, img, { pixelRatio: ratio })
          }
        })
      })

      if (!m.getSource("activities")) {
        m.addSource("activities", {
          type: "geojson",
          generateId: true,
          data: geojsonRef.current || { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterMaxZoom: 16,
          clusterRadius: 50
        })
      }

      if (!m.getLayer("clusters")) {
        m.addLayer({
          id: "clusters",
          type: "circle",
          source: "activities",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1"
            ],
            "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
          }
        })
      }

      if (!m.getLayer("cluster-count")) {
        m.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "activities",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
          }
        })
      }

      if (!m.getLayer("unclustered-symbol")) {
        m.addLayer({
          id: "unclustered-symbol",
          type: "symbol",
          source: "activities",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["get", "icon"],
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
          }
        })
      }
    }

    map.on("load", () => {
      if (!mapRef.current) return
      setMapReady(true)

      geojsonRef.current = { type: "FeatureCollection", features: [] }
      setupSourceAndLayers(map)

      if (onClick) {
        map.on("click", "unclustered-symbol", e => {
          const item = e.features?.[0]
          onClick(item?.properties?.id || "")
          e.preventDefault()
        })
      }

      if (onAnywhereClick) {
        map.on("click", e => {
          if (!mapRef.current) return
          const symbolFeatures = mapRef.current.queryRenderedFeatures(e.point, {
            layers: ["unclustered-symbol"]
          })
          if (symbolFeatures.length > 0) return
          onAnywhereClick()
        })
      }

      // Expand cluster on click
      map.on("click", "clusters", e => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })
        const feature = features[0]
        if (!feature) return
        const clusterId = (feature.properties as Record<string, number>).cluster_id
        const src = map.getSource("activities") as mapboxgl.GeoJSONSource
        if (!src) return
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates
          map.easeTo({ center: [lng, lat], zoom: zoom! })
        })
      })

      updateSelectedIcon(selectedIdRef.current)

      // Cursor changes
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer"
      })
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = ""
      })
      map.on("mouseenter", "unclustered-symbol", () => {
        map.getCanvas().style.cursor = "pointer"
      })
      map.on("mouseleave", "unclustered-symbol", () => {
        map.getCanvas().style.cursor = ""
      })
    })

    // Re-add source and layers after style change (satellite toggle)
    map.on("style.load", () => {
      if (!mapRef.current) return
      setupSourceAndLayers(map)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update items
  useEffect(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (!mapRef.current) return

    if (singleItem) {
      const marker = new mapboxgl.Marker({
        element: getCustomMarkerElement(),
        anchor: "bottom"
      })
        .setLngLat([singleItem.coordinates.longitude, singleItem.coordinates.latitude])
        .addTo(mapRef.current)
      markersRef.current.push(marker)
    }

    const mySource = mapRef.current.getSource("activities") as mapboxgl.GeoJSONSource
    if (mySource) {
      const mapItems = items ? spreadOverlappingPoints(toMapItems(items)) : []
      const data: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: mapItems
          .filter(r => r.name && r.coordinates)
          .map(item => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [item.coordinates.longitude, item.coordinates.latitude]
            },
            properties: {
              id: item.item?.id || item.name,
              category: item.category,
              icon: item.category + (item.item && isPlaceActivity(item.item) ? "_pl" : "_ev"),
              originalIcon:
                item.category + (item.item && isPlaceActivity(item.item) ? "_pl" : "_ev")
            }
          }))
      }
      geojsonRef.current = data
      mySource.setData(data)
      updateSelectedIcon(selectedIdRef.current)
    }
  }, [items, singleItem])

  // Update selected item
  useEffect(() => {
    selectedIdRef.current = selectedItemId || null
    updateSelectedIcon(selectedItemId || null)
  }, [selectedItemId, items])

  // Handle center changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter([center.longitude, center.latitude])
    }
  }, [center.latitude, center.longitude])

  // Emit bounds
  useEffect(() => {
    if (!mapRef.current || !setBounds || !mapReady) return
    const debounceInterval = 100
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const emitBounds = () => {
      startTransition(() => {
        if (!mapRef.current) return
        const b = mapRef.current.getBounds()
        const sw = b.getSouthWest()
        const ne = b.getNorthEast()
        const next: B = {
          sw: { latitude: sw.lat, longitude: sw.lng },
          ne: { latitude: ne.lat, longitude: ne.lng }
        }
        if (!boundsChanged(prevBoundsRef.current, next)) return
        prevBoundsRef.current = next
        setBoundsRef.current?.(next.sw, next.ne)
        const c = mapRef.current.getCenter()
        onViewportChangeRef.current?.({
          center: { latitude: c.lat, longitude: c.lng },
          zoom: mapRef.current.getZoom()
        })
      })
    }

    const debouncedEmit = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(emitBounds, debounceInterval)
    }
    const onMoveStart = () => setLoading(true)
    const onMove = () => debouncedEmit()
    const onIdle = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      emitBounds()
      setLoading(false)
    }

    emitBounds()
    mapRef.current.on("movestart", onMoveStart)
    mapRef.current.on("move", onMove)
    mapRef.current.on("idle", onIdle)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      mapRef.current?.off("movestart", onMoveStart)
      mapRef.current?.off("move", onMove)
      mapRef.current?.off("idle", onIdle)
    }
  }, [mapReady, setBounds])

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <button
        onClick={toggleSatellite}
        title={isSatellite ? "Widok mapy" : "Widok satelitarny"}
        style={{
          position: "absolute",
          bottom: 24,
          left: 10,
          width: 40,
          height: 40,
          borderRadius: 8,
          border: "none",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1
        }}
      >
        {isSatellite ? <MapIcon fontSize="small" /> : <SatelliteAltIcon fontSize="small" />}
      </button>
      {(loading || isPending) && <LinearProgress />}
    </div>
  )
}

export default Map
