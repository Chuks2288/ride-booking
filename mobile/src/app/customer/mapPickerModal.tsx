import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import { modalStyles } from "@/styles/modalStyles";
import MapView, { Region } from "react-native-maps";
import { useUserStore } from "@/store/userStore";
import {
  getLatLong,
  getPlacesSuggestions,
  reverseGeocode,
} from "@/utils/mapUtils";
import LocationItem from "./locationItem";

import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap";
import { mapStyles } from "@/styles/mapStyles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onSelectLocation: (location: any) => void;
}

interface LocationItemType {
  place_id: string;
  osm_id: number;
  osm_type: string;
  title: string;
  description: string;
  geometry: any;
}

const MapPickerModal: FC<MapPickerModalProps> = ({
  visible,
  onClose,
  title,
  selectedLocation,
  onSelectLocation,
}) => {
  const { location } = useUserStore();

  const mapRef = useRef<MapView>(null);
  const textInputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  //   const [locations, setLocations] = useState([]);
  const [locations, setLocations] = useState<LocationItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchLocation = async (query: string) => {
    if (query?.length > 4) {
      setLoading(false);
      setHasSearched(false);
      const data = await getPlacesSuggestions(query);
      setLocations(data);
      setLoading(false);
      setHasSearched(true);
    } else {
      setLoading(false);
      setHasSearched(false);
      setLocations([]);
    }
  };

  useEffect(() => {
    if (selectedLocation?.latitude) {
      setAddress(selectedLocation?.address);
      setRegion({
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });

      mapRef?.current?.fitToCoordinates(
        [
          {
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
          },
        ],
        {
          edgePadding: { top: 50, left: 50, bottom: 50, right: 50 },
          animated: true,
        }
      );
    }
  }, [selectedLocation, mapRef]);

  //   const addLocation = async (place_id: string) => {
  //     const data = await getLatLong(place_id);
  //     if (data) {
  //       setRegion({
  //         latitude: data.latitude,
  //         longitude: data.longitude,
  //         latitudeDelta: 0.5,
  //         longitudeDelta: 0.5,
  //       });
  //       setAddress(data.address);
  //     }
  //     textInputRef.current?.blur();
  //     setText("");
  //   };

  const addLocation = async (place_id: string) => {
    const place = locations.find((loc) => loc.place_id === place_id);
    if (!place) {
      console.warn("Place not found for place_id:", place_id);
      return;
    }
    const data = await getLatLong(place.osm_id, place.osm_type);
    if (data) {
      setRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
      setAddress(data.address);
    }
    textInputRef.current?.blur();
    setText("");
  };

  const renderLocations = ({ item }: any) => (
    <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
  );

  const handleRegionChangeComplete = async (newRegion: Region) => {
    try {
      const address = await reverseGeocode(
        newRegion?.latitude,
        newRegion?.longitude
      );
      setRegion(newRegion);
      setAddress(address);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGpsButtonPress = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      mapRef.current?.fitToCoordinates([{ latitude, longitude }], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      const address = await reverseGeocode(latitude, longitude);
      setAddress(address);
      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <Text style={modalStyles.centerText}>Select {title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={modalStyles.cancelButton}>Cancel</Text>
        </TouchableOpacity>

        <View style={modalStyles.searchContainer}>
          <Ionicons name="search-outline" size={RFValue(16)} color="#777" />
          <TextInput
            ref={textInputRef}
            style={modalStyles.input}
            placeholder="Search address"
            placeholderTextColor="#aaa"
            value={text}
            onChangeText={(e) => {
              setText(e);
              fetchLocation(e);
            }}
          />
        </View>

        {text !== "" ? (
          <FlatList
            ListHeaderComponent={
              <View>
                {text.length > 4 ? null : (
                  <Text style={{ marginHorizontal: 16 }}>
                    Enter at least 4 characters to search
                  </Text>
                )}
              </View>
            }
            data={locations}
            renderItem={renderLocations}
            keyExtractor={(item: any) => item.place_id}
            initialNumToRender={5}
            windowSize={5}
            ListFooterComponent={
              loading ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#3C75BE" />
                </View>
              ) : hasSearched && locations.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={{ color: "#888" }}>No results found</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <>
            <View style={{ flex: 1, width: "100%" }}>
              <MapView
                ref={mapRef}
                maxZoomLevel={16}
                minZoomLevel={12}
                pitchEnabled={false}
                onRegionChangeComplete={handleRegionChangeComplete}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude:
                    region?.latitude ??
                    location?.latitude ??
                    indiaIntialRegion?.latitude,
                  longitude:
                    region?.longitude ??
                    location?.longitude ??
                    indiaIntialRegion?.longitude,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }}
                // provider="google"
                showsMyLocationButton={false}
                showsCompass={false}
                showsIndoors={false}
                showsIndoorLevelPicker={false}
                showsTraffic={false}
                showsScale={false}
                showsBuildings={false}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
              />
              <View style={mapStyles.centerMarkerContainer}>
                <Image
                  source={
                    title == "drop"
                      ? require("@/assets/icons/drop_marker.png")
                      : require("@/assets/icons/marker.png")
                  }
                  style={mapStyles.marker}
                />
              </View>
              <TouchableOpacity
                style={mapStyles.gpsButton}
                onPress={handleGpsButtonPress}
              >
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={RFValue(16)}
                  color="#3C75BE"
                />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.footerContainer}>
              <Text style={modalStyles.addressText} numberOfLines={2}>
                {address === "" ? "Getting address..." : address}
              </Text>
              <View style={modalStyles.buttonContainer}>
                <TouchableOpacity
                  style={modalStyles.button}
                  onPress={() => {
                    onSelectLocation({
                      type: title,
                      latitude: region?.latitude,
                      longitude: region?.longitude,
                      address: address,
                    });
                    // onClose();
                  }}
                >
                  <Text style={modalStyles.buttonText}>Set Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default memo(MapPickerModal);
