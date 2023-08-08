import { type Colors } from '@/stores/colors'
import { formatFriendlyTime } from '@/utils/date-utils'
import { type AvailableRoom, type RoomEntry } from '@/utils/room-utils'

export const _addRoom = (
    room: RoomEntry,
    availableRooms: AvailableRoom[],
    mapRef: any,
    colors: Colors
): void => {
    const coordinates = [[...room.coordinates]]
    const name = room?.properties?.Raum
    const functionType = room?.properties?.Funktion
    const avail = availableRooms?.find((x) => x.room === name)

    const color = avail != null ? colors.primary : 'grey'

    if (coordinates == null) return
    mapRef.current?.injectJavaScript(`
var geojsonFeature = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": ${JSON.stringify(coordinates)}
    },
};

L.geoJSON(geojsonFeature, {
    color: ${JSON.stringify(color)},
    fillOpacity: 0.2,
}).addTo(mymap).bringToBack()
.bindPopup("<b>${name.toString()} </b><br>${
        functionType != null ? functionType.toString() : ''
    }<br>${
        avail != null
            ? 'Free from ' +
              formatFriendlyTime(avail.from) +
              ' to ' +
              formatFriendlyTime(avail.until)
            : ''
    }");
true
`)
}

export const _removeAllGeoJson = (mapRef: any): void => {
    mapRef.current?.injectJavaScript(`
        mymap.eachLayer(function (layer) {
            if (layer instanceof L.GeoJSON) {
                mymap.removeLayer(layer);
            }
        });
        true
    `)
}

export const _setView = (center: number[] | undefined, mapRef: any): void => {
    if (center == null) return
    mapRef.current?.injectJavaScript(`
mymap.setView(${JSON.stringify(center)}, 17.5);
true;
`)
}
