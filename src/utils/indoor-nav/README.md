# Indoor navigation (building G, Ingolstadt)

Routing and turn-by-turn UI for **Standort IN / Gebäude G**. Static GeoJSON is
loaded from [assets.neuland.app](https://assets.neuland.app):

| Asset | URL |
| --- | --- |
| Rooms (map overlay) | `rooms_neuland_v2.7.geojson` |
| Doors | `doors_neuland.geojson` |
| Entrances | `entrances_neuland.geojson` |
| Corridors | `corridors_neuland.geojson` |

Behaviour is kept in sync with
[neuland-map-data `indoor-nav/g`](https://github.com/neuland-ingolstadt/neuland-map-data/tree/main/indoor-nav/g).

| This repo | Reference (`neuland-map-data/indoor-nav/g/src/lib`) |
| --- | --- |
| `corridor.ts` | `corridor.ts` |
| `walkable.ts` | `walkable.ts` |
| `geometry.ts` | `geometry.ts` |
| `graph-build.ts` | `graph.ts` (graph construction) |
| `routing.ts` | `graph.ts` (path expansion + `route`) |
| `maneuvers.ts` | `graph.ts` (maneuvers + `placeLabel`) |
| `route-geojson.ts` | stair shafts, entrances, `pickLegForFloor` |
| `format.ts` | distance/duration helpers |
| `journey-copy.ts` | `journey-copy.ts` |
| `journey-visualization.ts` | progress / marker GeoJSON in reference |
| Turn-by-turn copy | `src/localization/{de,en}/indoor-nav.json`; utils take `TFunction<'indoor-nav'>` |

Routing / maneuver logic changes should be applied in both places and covered by
`src/utils/tests/indoor-nav-*.test.ts` (tests fetch the live assets).

Feature flag: `indoor-navigation` in Flipt (`FeatureFlagKeys.indoorNavigation`).
Local preview: `EXPO_PUBLIC_INDOOR_NAV_PREVIEW=1` in `.env.local`.
