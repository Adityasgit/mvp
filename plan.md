# Next.js MVP Plan — Campus Navigator AR

## Goal

Build a very small MVP using **only Next.js** with **no backend**.  
All data will be stored in **localStorage** and managed through an **admin route**.

The MVP will have:

- an **admin route** to add/edit campus data
- a **navigator route** to show:
  - camera view
  - current location indicator
  - AR-style labels / path markers
- data entry from **GeoJSON.io**
- extra properties in stored data to support future AR expansion

---

## MVP Scope

### Included

- Next.js app only
- LocalStorage as the data store
- Admin page for CRUD-like data entry
- Navigator page with camera-based view
- Current location display
- Path / point / polygon overlays for AR use
- GeoJSON import format support
- Basic routing between pages

### Not Included

- No backend
- No database
- No authentication
- No realtime sync
- No map provider integration
- No live GPS routing engine
- No cloud storage
- No server-side APIs

---

## Pages / Routes

### 1. `/admin`
This route will be used to manage the local data.

Responsibilities:

- Add new campus features
- Edit existing features
- Delete features
- Import GeoJSON data
- Save data into localStorage
- Add AR-specific extra metadata to each feature

### 2. `/navigator`
This route will be the user-facing AR view.

Responsibilities:

- Open camera feed
- Read current location from browser geolocation
- Load data from localStorage
- Render AR labels / direction markers
- Show only the current location context
- Display paths and target POIs relevant to the user

---

## Data Model

We will store three geometry types:

- **polygons** → buildings / blocks / campus areas
- **points** → canteens, entrances, POIs, checkpoints
- **lines** → roads, walking paths, guiding paths

Use a single normalized structure in localStorage, but keep a `geometryType` field.

### Suggested localStorage key

```js
campusNavigatorData
```

### Suggested structure

```js
{
  "version": 1,
  "updatedAt": "2026-06-25T00:00:00.000Z",
  "features": [
    {
      "id": "feature_1",
      "name": "Main Canteen",
      "geometryType": "point",
      "coordinates": [75.8577, 30.9010],
      "category": "canteen",
      "description": "North campus canteen",
      "floor": 0,
      "blockCode": null,
      "ar": {
        "label": "Main Canteen",
        "showInAr": true,
        "icon": "canteen",
        "priority": 1,
        "displayDistance": true,
        "displayDirection": true
      },
      "meta": {
        "isActive": true,
        "tags": ["food", "crowded"],
        "createdAt": "2026-06-25T00:00:00.000Z",
        "updatedAt": "2026-06-25T00:00:00.000Z"
      }
    }
  ]
}
```

---

## Feature Types

### Point
Use for:

- canteens
- gates
- entrances
- statues
- help desks
- fixed AR targets

### Line
Use for:

- roads
- footpaths
- directional paths
- safe walking routes

### Polygon
Use for:

- academic blocks
- hostels
- library
- sports areas
- parking zones
- gardens

---

## Admin Route Plan

### Admin UI sections

1. **Feature List**
   - show all stored features
   - filter by geometry type
   - search by name

2. **Add Feature Form**
   - name
   - geometry type
   - coordinates
   - category
   - description
   - AR config fields

3. **Edit Feature Panel**
   - update existing data
   - update AR metadata
   - save back to localStorage

4. **Import GeoJSON**
   - paste/import GeoJSON text
   - parse features
   - convert each feature into localStorage format
   - preserve coordinates and properties

5. **Export Data**
   - copy JSON
   - download JSON file
   - useful for backup

### Admin responsibilities

The admin route must allow setting extra AR properties such as:

- `showInAr`
- `label`
- `priority`
- `icon`
- `displayDistance`
- `displayDirection`
- `targetRadius`
- `highlightColor`

---

## Navigator Route Plan

### Navigator UI sections

1. **Camera layer**
   - camera opened through browser permissions
   - full-screen mobile-first layout

2. **Current location indicator**
   - use browser geolocation
   - show user position relative to loaded campus data

3. **AR overlay layer**
   - show labels on top of camera
   - show arrows or guidance tags
   - show selected destination
   - show nearest relevant points / paths

4. **Controls**
   - enable/disable AR labels
   - select target feature
   - recenter on current location
   - toggle debug mode

### Navigator behavior

- load feature data from localStorage
- get live geolocation
- compute distance and direction to features
- show nearby POIs only
- show only relevant routes and markers
- keep rendering lightweight for mobile browsers

---

## GeoJSON.io Workflow

We will use **GeoJSON.io** as the source of coordinates.

### Workflow

1. Draw buildings, roads, and points in GeoJSON.io
2. Export as GeoJSON
3. Paste/import it into `/admin`
4. Parse features into the app’s internal schema
5. Store in localStorage
6. Use the stored data in `/navigator`

### Import rules

- Polygon → store as `geometryType: "polygon"`
- LineString → store as `geometryType: "line"`
- Point → store as `geometryType: "point"`

### Property mapping

Keep GeoJSON properties, but map them into a clean schema:

- `name`
- `category`
- `description`
- `floor`
- `blockCode`
- `ar`
- `meta`

---

## Frontend Tech Stack

Use:

- **Next.js**
- **React**
- **TypeScript** if possible
- **Tailwind CSS** for UI
- **Zustand** or simple React state for local state
- **localStorage** utilities for persistence

### Helpful browser APIs

- `navigator.geolocation`
- `navigator.mediaDevices.getUserMedia`
- `window.localStorage`

---

## Suggested Folder Structure

```text
app/
  admin/
    page.tsx
  navigator/
    page.tsx
components/
  admin/
    FeatureForm.tsx
    FeatureList.tsx
    GeoJsonImporter.tsx
  navigator/
    CameraView.tsx
    ArOverlay.tsx
    CurrentLocation.tsx
    FeatureCard.tsx
lib/
  storage.ts
  geojson.ts
  geometry.ts
  arMath.ts
  types.ts
```

---

## Utility Modules

### `storage.ts`
Responsible for:

- reading localStorage
- writing localStorage
- resetting data
- versioning data

### `geojson.ts`
Responsible for:

- parsing GeoJSON
- converting GeoJSON features to internal format
- validating coordinates

### `geometry.ts`
Responsible for:

- distance calculation
- bearing calculation
- nearest feature detection
- optional polygon centroid extraction

### `arMath.ts`
Responsible for:

- screen position estimation
- direction mapping
- feature visibility logic
- simple compass angle handling

---

## AR Logic for MVP

This MVP does not need advanced native AR.

The basic AR behavior can be:

- show camera feed
- calculate bearing from current location to target feature
- render overlay labels in the approximate direction
- show distance text
- optionally show a simple arrow pointing toward the destination

### Basic formula needs

- latitude / longitude distance
- compass heading
- bearing to target
- angle difference
- visibility threshold

### Example logic

- if a feature is within range, show it
- if feature is behind the user, hide it
- if feature is in front, display marker near center
- if target is selected, pin it with a stronger highlight

---

## LocalStorage Keys

Suggested keys:

```text
campusNavigatorData
campusNavigatorSettings
campusNavigatorLastTarget
campusNavigatorDrafts
```

### Example use

- `campusNavigatorData` → saved campus features
- `campusNavigatorSettings` → debug mode, AR toggles
- `campusNavigatorLastTarget` → last selected target
- `campusNavigatorDrafts` → unsaved admin edits

---

## Validation Rules

Before saving data:

- coordinates must exist
- geometry type must be valid
- names must not be empty
- point must have `[lng, lat]`
- line must have at least two coordinates
- polygon must have a closed coordinate ring or be normalized

---

## MVP Build Steps for the Agent

### Phase 1 — App skeleton
- Create Next.js app
- Add `/admin` and `/navigator` routes
- Create shared layout and basic navigation

### Phase 2 — Data storage
- Build localStorage read/write helpers
- Define feature schema
- Seed sample data

### Phase 3 — Admin panel
- Build feature form
- Add import from GeoJSON
- Add edit and delete actions
- Persist to localStorage

### Phase 4 — Navigator
- Open camera
- Fetch geolocation
- Load saved campus data
- Render labels and guidance overlays

### Phase 5 — AR helpers
- Distance calculation
- Bearing calculation
- Feature selection
- Current-location marker
- Simple route direction UI

### Phase 6 — Polish
- Mobile responsive UI
- Permission handling
- Empty states
- Error handling
- Reset data button
- Export data button

---

## Acceptance Criteria

The MVP is done when:

- admin can add data manually
- admin can import GeoJSON
- all data is saved in localStorage
- navigator route opens camera
- navigator shows current location
- navigator overlays AR labels for stored features
- no backend is needed
- app works in browser on mobile

---

## Notes for the Agent

- Keep everything client-side
- Do not introduce APIs or DB
- Use localStorage as the single source of truth
- Keep geometry and AR metadata extensible
- Make the admin route simple but structured
- Make navigator lightweight and mobile-first
- Use GeoJSON.io as the coordinate creation workflow

---

## Future Upgrade Path

Later, this MVP can evolve into:

- proper backend
- database storage
- admin authentication
- live location tracking
- route navigation engine
- richer AR rendering
- map view
- public/private roles

But for now, keep it as a **clean Next.js proof of concept**.
