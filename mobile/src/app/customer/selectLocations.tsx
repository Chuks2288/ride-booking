// import {
//   View,
//   Text,
//   StatusBar,
//   TouchableOpacity,
//   FlatList,
//   Image,
// } from "react-native";
// import React, { useState } from "react";
// import { homeStyles } from "@/styles/homeStyles";
// import LocationBar from "@/components/customer/locationBar";
// import { useUserStore } from "@/store/userStore";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { commonStyles } from "@/styles/commonStyles";
// import { router } from "expo-router";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Colors } from "@/utils/Constants";
// import CustomText from "@/components/shared/customText";
// import { uiStyles } from "@/styles/uiStyles";
// import LocationInput from "./locationInput";
// import { getLatLong, getPlacesSuggestions } from "@/utils/mapUtils";
// import { locationStyles } from "@/styles/locationStyles";
// import LocationItem from "./locationItem";

// const LocationSelection = () => {
//   const { location, setLocation } = useUserStore();

//   const [pickup, setPickup] = useState("");
//   const [pickupCoords, setPickupCoords] = useState<any>(null);
//   const [dropCoords, setDropCoords] = useState<any>(null);
//   const [drop, setDrop] = useState("");
//   const [locations, setLocations] = useState([]);
//   const [focusedInput, setFocusedInput] = useState("drop");
//   const [modalTitle, setModalTitle] = useState("drop");
//   const [isMapModalVisible, setIsMapModalVisible] = useState(false);

//   const fetchLocation = async (query: string) => {
//     if (query?.length > 4) {
//       const data = await getPlacesSuggestions(query);
//       setLocations(data);
//     }
//   };

//   const addLocation = async (id: string) => {
//     const data = await getLatLong(id);
//     if (data) {
//       if (focusedInput === "drop") {
//         setDrop(data?.address);
//         setDropCoords(data);
//       } else {
//         setLocation(data);
//         setPickupCoords(data);
//         setPickup(data?.address);
//       }
//     }
//   };

//   const renderLocations = ({ item }: any) => {
//     return (
//       <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
//     );
//   };

//   return (
//     <View style={homeStyles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="orange"
//         translucent={false}
//       />
//       <SafeAreaView />
//       <TouchableOpacity
//         style={commonStyles.flexRow}
//         onPress={() => router.back()}
//       >
//         <Ionicons name="chevron-back" size={24} color={Colors.iosColor} />
//         <CustomText fontFamily="Regular" style={{ color: Colors.iosColor }}>
//           Back
//         </CustomText>
//       </TouchableOpacity>

//       <View style={uiStyles.locationInputs}>
//         <LocationInput
//           placeholder="Search Pickup Location"
//           type="pickup"
//           value={pickup}
//           onChangeText={(text) => {
//             setPickup(text);
//             // fetchLocation(text);
//             if (focusedInput === "pickup") fetchLocation(text);
//           }}
//           onFocus={() => setFocusedInput("pickup")}
//         />

//         <LocationInput
//           placeholder="Search Drop Location"
//           type="drop"
//           value={drop}
//           onChangeText={(text) => {
//             setDrop(text);
//             // fetchLocation(text);
//             if (focusedInput === "drop") fetchLocation(text);
//           }}
//           onFocus={() => setFocusedInput("drop")}
//         />

//         <CustomText
//           fontFamily="Medium"
//           fontSize={10}
//           style={uiStyles.suggestionText}
//         >
//           {focusedInput} suggestions
//         </CustomText>
//       </View>

//       <FlatList
//         data={locations}
//         renderItem={renderLocations}
//         keyExtractor={(item: any) => item?.place_id}
//         initialNumToRender={5}
//         windowSize={5}
//         ListFooterComponent={
//           <TouchableOpacity
//             style={[commonStyles.flexRow, locationStyles.container]}
//             onPress={() => {
//               setModalTitle(focusedInput);
//               setIsMapModalVisible(true);
//             }}
//           >
//             <Image
//               source={require("@/assets/icons/map_pin.png")}
//               style={uiStyles.mapPinIcon}
//             />
//             <CustomText fontFamily="Medium" fontSize={12}>
//               Select from Map
//             </CustomText>
//           </TouchableOpacity>
//         }
//       />
//     </View>
//   );
// };

// export default LocationSelection;

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
// import { debounce } from "lodash";

import CustomText from "@/components/shared/customText";
import LocationInput from "../../components/customer/locationInput";
import LocationItem from "../../components/customer/locationItem";
import MapPickerModal from "../../components/customer/mapPickerModal";

import {
  getPlacesSuggestions,
  getLatLong,
  calculateDistance,
} from "@/utils/mapUtils";
import { useUserStore } from "@/store/userStore";
import { homeStyles } from "@/styles/homeStyles";
import { commonStyles } from "@/styles/commonStyles";
import { uiStyles } from "@/styles/uiStyles";
import { locationStyles } from "@/styles/locationStyles";
import { Colors } from "@/utils/Constants";
import { router } from "expo-router";

type Coordinates = {
  latitude: number;
  longitude: number;
  address: string;
};

type Place = {
  place_id: string;
  osm_id: number;
  osm_type: string;
  title: string;
  description: string;
  geometry: any;
};

const LocationSelection = () => {
  const { location, setLocation } = useUserStore();
  const isFocused = useIsFocused();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropCoords, setDropCoords] = useState<any>(null);
  // const [locations, setLocations] = useState<any[]>([]);
  const [locations, setLocations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"pickup" | "drop">("drop");
  const [modalTitle, setModalTitle] = useState("drop");
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const fetchLocation = async (query: string) => {
    if (!location?.latitude || !location?.longitude) return;

    setLoading(true);
    const data = await getPlacesSuggestions(query);
    setLocations(data);
    setLoading(false);
  };

  // const addLocation = async (id: string) => {
  //   const data = await getLatLong(id);
  //   if (!data) return;

  //   if (focusedInput === "drop") {
  //     setDrop(data.address);
  //     setDropCoords(data);
  //   } else {
  //     setPickup(data.address);
  //     setLocation(data);
  //     setPickupCoords(data);
  //   }
  //   setLocations([]);
  // };

  const addLocation = async (place_id: string) => {
    const place = locations.find((loc) => loc.place_id === place_id);
    if (!place) {
      console.warn("Selected place not found in locations");
      return;
    }

    const data = await getLatLong(place.osm_id, place.osm_type);
    if (!data) return;

    if (focusedInput === "drop") {
      setDrop(data.address);
      setDropCoords(data);
    } else {
      setPickup(data.address);
      setPickupCoords(data);
      setLocation(data);
    }

    setLocations([]);
  };

  const renderLocations = ({ item }: any) => (
    <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
  );

  const checkDistance = async () => {
    if (!pickupCoords || !dropCoords) return;

    const { latitude: lat1, longitude: lon1 } = pickupCoords;
    const { latitude: lat2, longitude: lon2 } = dropCoords;

    if (lat1 === lat2 && lon1 === lon2) {
      alert(
        "Pickup and drop locations cannot be same. Please select different locations"
      );
      return;
    }

    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    const minDistance = 0.5; // Minimum distance in km (e.g., 500meters)
    // const maxDistance = 0.5; // Minimum distance in km (e.g., 50 km)
    const maxDistance = 50; // Minimum distance in km (e.g., 50000 km)

    if (distance < minDistance) {
      alert(
        "The selected locations are too close. Please choose locations that are far apart"
      );
    } else if (distance > maxDistance) {
      alert(
        "The selected locations are too far apart. Please select a closer drop locations"
      );
    } else {
      setLocations([]);
      router.navigate({
        pathname: "/customer/ridebooking",
        params: {
          distanceInKm: distance.toFixed(2),
          drop_latitude: dropCoords?.latitude,
          drop_longitude: dropCoords?.longitude,
          drop_address: drop,
        },
      });
      // setDrop("")
      // setPickup("")
      // setDropCoords(null)
      // setPickupCoords(null)
      // setIsMapModalVisible(false)
      console.log(`Distance is valid : ${distance.toFixed(2)} km`);
    }
  };

  useEffect(() => {
    if (dropCoords && pickupCoords) {
      checkDistance();
    } else {
      setLocations([]);
      setIsMapModalVisible(false);
    }
  }, [dropCoords, pickupCoords]);

  useEffect(() => {
    if (location) {
      setPickupCoords(location);
      setPickup(location?.address);
    }
  }, [location]);

  return (
    <View style={homeStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />
      <SafeAreaView />

      <TouchableOpacity
        style={commonStyles.flexRow}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.iosColor} />
        <CustomText style={{ color: Colors.iosColor }}>Back</CustomText>
      </TouchableOpacity>

      <View style={uiStyles.locationInputs}>
        <LocationInput
          placeholder="Search Pickup Location"
          type="pickup"
          value={pickup}
          onChangeText={(text) => {
            setPickup(text);
            fetchLocation(text);
          }}
          onFocus={() => setFocusedInput("pickup")}
          onClear={() => setPickup("")}
        />
        <LocationInput
          placeholder="Search Drop Location"
          type="drop"
          value={drop}
          onChangeText={(text) => {
            setDrop(text);
            fetchLocation(text);
          }}
          onFocus={() => setFocusedInput("drop")}
          onClear={() => setDrop("")}
        />
        <CustomText
          fontFamily="Medium"
          fontSize={10}
          style={uiStyles.suggestionText}
        >
          {focusedInput} suggestions
        </CustomText>
      </View>

      {(loading || locations.length > 0) && (
        <FlatList
          style={{ backgroundColor: "#fff" }}
          data={locations}
          renderItem={renderLocations}
          initialNumToRender={5}
          windowSize={5}
          keyExtractor={(item: any) => item.place_id}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            loading ? (
              <View style={{ padding: 12, alignItems: "center" }}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : (
              <TouchableOpacity
                style={[commonStyles.flexRow, locationStyles.container]}
                onPress={() => {
                  setModalTitle(focusedInput);
                  setIsMapModalVisible(true);
                }}
              >
                <Image
                  source={require("@/assets/icons/map_pin.png")}
                  style={uiStyles.mapPinIcon}
                />
                <CustomText fontFamily="Medium" fontSize={12}>
                  Select from Map
                </CustomText>
              </TouchableOpacity>
            )
          }
        />
      )}

      {isMapModalVisible && (
        <MapPickerModal
          selectedLocation={{
            latitude:
              focusedInput === "drop"
                ? dropCoords?.latitude
                : pickupCoords?.latitude,
            longitude:
              focusedInput === "drop"
                ? dropCoords?.longitude
                : pickupCoords?.longitude,
            address: focusedInput === "drop" ? drop : pickup,
          }}
          title={modalTitle}
          visible={isMapModalVisible}
          onClose={() => setIsMapModalVisible(false)}
          onSelectLocation={(data: Coordinates) => {
            if (data) {
              if (modalTitle === "drop") {
                setDropCoords(data);
                setDrop(data?.address);
              } else {
                setPickupCoords(data);
                setPickup(data?.address);
                setLocation(data);
              }
            }
          }}
        />
      )}
    </View>
  );
};

export default LocationSelection;
