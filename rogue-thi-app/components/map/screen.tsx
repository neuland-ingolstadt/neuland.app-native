import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
export function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        showsPointsOfInterest={false}
        showsBuildings={false}
        // mapType={Platform.OS == "android" ? "none" : "standard"}
        style={styles.map}
        initialRegion={{
          latitude: 48.76659,
          longitude: 11.43328,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.00421,
        }}
        // minZoomLevel={15}
        loadingEnabled={true}
        showsUserLocation={true}
        showsMyLocationButton={true}
        userLocationCalloutEnabled={true}
      >
        <Marker
          draggable
          coordinate={{ latitude: 48.76659, longitude: 11.43328 }}
          title={"THI"}
          description={"Technische Hochschule Ingolstadt"}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
