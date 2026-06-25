# Campus Navigator AR — Usage Guide

## Overview

This app has two main screens:

| Route | Purpose |
|---|---|
| `/admin` | Add, edit, delete campus features. Import from GeoJSON.io. |
| `/navigator` | Live camera view with AR labels and Mapbox mini-map. |

All data is saved in your browser's localStorage. No account or backend needed.

---

## Step 1 — Draw your campus on GeoJSON.io

[geojson.io](https://geojson.io) is a free browser tool for drawing points, lines, and polygons on a map and exporting coordinates.

### How to draw

1. Open [geojson.io](https://geojson.io) in your browser.
2. Navigate to your campus on the map (search or scroll).
3. Use the toolbar on the right to draw:

| Tool | Use for |
|---|---|
| **Point marker** | Canteens, gates, entrances, statues, help desks |
| **Line** | Roads, walking paths, corridors |
| **Polygon** | Buildings, hostels, parking zones, sports areas |

4. After drawing a shape, a popup appears on the left. Add properties:
   ```json
   {
     "name": "Main Canteen",
     "category": "canteen",
     "description": "North campus canteen"
   }
   ```
5. Draw as many features as you need.

### How to export

Once done drawing:

1. Click **Save** → **GeoJSON** in the top menu bar.
2. Copy all the JSON text — it looks like this:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [75.8577, 30.9010]
      },
      "properties": {
        "name": "Main Canteen",
        "category": "canteen"
      }
    }
  ]
}
```

> **Note:** GeoJSON coordinates are `[longitude, latitude]` — longitude first, latitude second. This is the opposite of Google Maps which shows lat first.

---

## Step 2 — Import into Admin

1. Open [http://localhost:3000/admin](http://localhost:3000/admin).
2. Scroll down to the **Import GeoJSON** section and click it to expand.
3. Paste your GeoJSON text into the textarea.
4. Click **Import Features**.
5. You'll see a confirmation like `Imported 5 features`.
6. Your features now appear in the sidebar list.

---

## Step 3 — Review and edit features

After importing, check each feature:

1. Click a feature in the sidebar to open it in the edit form.
2. Update the **AR settings**:
   - **Show in AR** — toggle on to make it visible in the navigator
   - **AR Label** — the text shown floating over the camera
   - **Priority** — 1 = highest priority (shown first), 5 = lowest
   - **Display distance** — show how far away it is
   - **Display direction** — show a direction arrow
3. Click **Save Changes**.

---

## Step 4 — Navigate

1. Open [http://localhost:3000/navigator](http://localhost:3000/navigator).
2. Allow **camera** and **location** permissions when prompted.
3. You'll see:
   - Live camera feed
   - AR labels floating in the direction of nearby features
   - Mapbox mini-map in the bottom-right corner

### Navigator controls

| Button | What it does |
|---|---|
| **AR On / AR Off** | Toggle the floating AR labels |
| **Set Target** | Pick a destination — it highlights in yellow on the map and in AR |
| **Map** | Show or hide the mini-map |
| **DBG** | Debug mode — shows raw GPS, heading, bearing data |

### Mini-map

- The blue dot is your current position.
- The dashed line shows your heading direction.
- Blue dots = points, green lines = paths, purple = buildings/polygons.
- Yellow = selected target.
- Click **⊞** on the map to expand it, **⊡** to shrink it back.

---

## Step 5 — Export and back up your data

On the Admin page, click **Export JSON** to download a backup of all your campus data. You can re-import this later using the GeoJSON importer.

---

## Troubleshooting

**AR labels aren't showing**
- Make sure features have **Show in AR** turned on in their AR settings.
- Labels only appear for features within the range limit (default 200m).
- They also only show when the feature is roughly in front of you (within the field of view).

**Map is blank / showing "Map unavailable"**
- Add your Mapbox token to `.env.local`:
  ```
  NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoixxxxxx...
  ```
- Restart the dev server after adding it.
- Get a free token at [mapbox.com](https://mapbox.com).

**Location not updating**
- Make sure you allowed location access in the browser.
- On desktop, GPS accuracy is low — the AR overlay works best on a phone with real GPS.

**Data disappeared**
- Data is stored in `localStorage` under the key `campusNavigatorData`.
- Clearing browser data/site data will erase it. Export a backup regularly.

---

## Coordinate format reference

| Geometry | Format | Example |
|---|---|---|
| Point | `[lng, lat]` | `[75.8577, 30.9010]` |
| Line | `[[lng,lat], [lng,lat], ...]` | `[[75.857, 30.900], [75.858, 30.901]]` |
| Polygon | `[[[lng,lat], ...]]` | `[[[75.857, 30.900], [75.858, 30.900], [75.858, 30.901], [75.857, 30.900]]]` |

Polygons must close — the first and last coordinate must be the same.
